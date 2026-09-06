import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type Book = { id: number; title: string; author: string | null; status: "wish" | "reading" | "finished"; rating: number | null; review: string | null; started_at: string | null; finished_at: string | null };
type Sentence = { id: number; book_id: number; content: string; page: number | null; tags: string[] | null; create_at: string | null };
type Memo = { id: number; book_id: number; content: string; page: string | null; created_at: string | null };
type Archive = { user_id: string; root_page_id: string; root_page_url: string; books_data_source_id: string };
type PageMapping = { id: number; source_type: "book" | "sentence" | "memo"; source_id: number; notion_page_id: string | null; notion_block_id: string | null };
type BookSections = { book_id: number; sentences_section_block_id: string; memos_section_block_id: string };
type NotionPage = { id: string; url: string };
type NotionDatabase = { data_sources?: Array<{ id: string }>; in_trash?: boolean };
type NotionDataSource = { properties: Record<string, { id: string; type: string }> };
type NotionBlock = { id: string };
type AppendBlocksResponse = { results: NotionBlock[] };

const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";
const STATUS_LABEL: Record<Book["status"], string> = { wish: "읽을 책", reading: "읽는 중", finished: "읽은 책" };
const truncate = (value: string, maxLength = 1800) => value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
const richText = (content: string) => content ? [{ type: "text", text: { content: truncate(content) } }] : [];
const toNotionDate = (value: string | null) => (value ? { start: value } : null);
const ratingStars = (rating: number | null) => {
  if (rating === null) return "";
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;
};
class NotionResourceNotFoundError extends Error {}

const notionRequest = async <T>(path: string, token: string, method: "GET" | "POST" | "PATCH", body?: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`${NOTION_API_URL}${path}`, { method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": NOTION_VERSION }, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Notion API request failed", { status: response.status, detail });
    if (response.status === 401) throw new Error("Notion 연결 토큰이 올바르지 않습니다. Supabase Secret을 확인해 주세요.");
    if (response.status === 403) throw new Error("Notion Integration에 콘텐츠 생성 권한이 없습니다.");
    if (response.status === 404) throw new NotionResourceNotFoundError("Notion 아카이브를 찾지 못했습니다.");
    throw new Error("Notion에 기록을 저장하지 못했습니다.");
  }
  return response.json() as Promise<T>;
};

const createBooksDatabase = async (token: string, parentPageId: string) => {
  const database = await notionRequest<NotionDatabase>("/databases", token, "POST", {
    parent: { type: "page_id", page_id: parentPageId }, title: richText("책장"), icon: { type: "emoji", emoji: "📚" }, is_inline: true,
    initial_data_source: { properties: {
      "책 제목": { title: {} }, 저자: { rich_text: {} },
      상태: { select: { options: [{ name: "읽을 책", color: "gray" }, { name: "읽는 중", color: "green" }, { name: "읽은 책", color: "blue" }] } },
      시작일: { date: {} }, 완독일: { date: {} }, 평점: { number: { format: "number" } }, 별점: { rich_text: {} }, 후기: { rich_text: {} },
    } },
  });
  const dataSourceId = database.data_sources?.[0]?.id;
  if (!dataSourceId) throw new Error("Notion 책장 표 정보를 확인하지 못했습니다.");
  return dataSourceId;
};

const ensureRatingProperties = async (token: string, dataSourceId: string) => {
  const dataSource = await notionRequest<NotionDataSource>(`/data_sources/${dataSourceId}`, token, "GET");
  const existingRating = dataSource.properties["별점"];

  if (existingRating?.type === "number") {
    await notionRequest(`/data_sources/${dataSourceId}`, token, "PATCH", {
      properties: { [existingRating.id]: { name: "평점" } },
    });
  }

  if (!existingRating || existingRating.type === "number") {
    await notionRequest(`/data_sources/${dataSourceId}`, token, "PATCH", {
      properties: { 별점: { rich_text: {} } },
    });
  }
};

const createArchive = async (token: string, parentPageId: string) => {
  const parentPage = await notionRequest<NotionPage>(`/pages/${parentPageId}`, token, "GET");
  return {
    root_page_id: parentPageId,
    root_page_url: parentPage.url,
    books_data_source_id: await createBooksDatabase(token, parentPageId),
  };
};

const syncBookPage = async (token: string, dataSourceId: string, mapping: PageMapping | undefined, book: Book) => {
  const properties = {
    "책 제목": { title: richText(book.title) }, 저자: { rich_text: richText(book.author ?? "") }, 상태: { select: { name: STATUS_LABEL[book.status] } },
    시작일: { date: toNotionDate(book.started_at) }, 완독일: { date: toNotionDate(book.finished_at) }, 평점: { number: book.rating }, 별점: { rich_text: richText(ratingStars(book.rating)) }, 후기: { rich_text: richText(book.review ?? "") },
  };
  if (mapping?.notion_page_id) {
    await notionRequest<NotionPage>(`/pages/${mapping.notion_page_id}`, token, "PATCH", { properties });
    return { notionPageId: mapping.notion_page_id, isNew: false };
  }
  const page = await notionRequest<NotionPage>("/pages", token, "POST", { parent: { type: "data_source_id", data_source_id: dataSourceId }, properties });
  return { notionPageId: page.id, isNew: true };
};

const appendBlocks = (token: string, parentBlockId: string, children: Record<string, unknown>[]) => notionRequest<AppendBlocksResponse>(`/blocks/${parentBlockId}/children`, token, "PATCH", { children });

const ensureBookSections = async (token: string, bookPageId: string, current: BookSections | undefined) => {
  if (current) return current;
  const response = await appendBlocks(token, bookPageId, [
    { object: "block", type: "toggle", toggle: { rich_text: richText("💬 기록한 문장"), color: "default" } },
    { object: "block", type: "toggle", toggle: { rich_text: richText("📝 메모"), color: "default" } },
  ]);
  const [sentencesSection, memosSection] = response.results;
  if (!sentencesSection?.id || !memosSection?.id) throw new Error("Notion 기록 섹션을 만들지 못했습니다.");
  return { book_id: 0, sentences_section_block_id: sentencesSection.id, memos_section_block_id: memosSection.id };
};

const sentenceBlock = (sentence: Sentence) => {
  const metadata = [sentence.page ? `${sentence.page}쪽` : null, ...(sentence.tags ?? []).filter(Boolean).map((tag) => `#${tag}`)].filter(Boolean).join(" · ");
  return { object: "block", type: "quote", quote: { rich_text: richText(metadata ? `${sentence.content}\n${metadata}` : sentence.content), color: "default" } };
};

const memoBlock = (memo: Memo) => {
  const metadata = memo.page ? `${memo.page}쪽` : "";
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: richText(metadata ? `${memo.content}\n${metadata}` : memo.content), color: "default" } };
};

const syncContentBlock = async (token: string, sectionBlockId: string, existingBlockId: string | null, block: Record<string, unknown>) => {
  if (existingBlockId) {
    await notionRequest<NotionBlock>(`/blocks/${existingBlockId}`, token, "PATCH", block);
    return existingBlockId;
  }
  const response = await appendBlocks(token, sectionBlockId, [block]);
  const [createdBlock] = response.results;
  if (!createdBlock?.id) throw new Error("Notion 기록을 추가하지 못했습니다.");
  return createdBlock.id;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    const notionToken = Deno.env.get("NOTION_TOKEN");
    const parentPageId = Deno.env.get("NOTION_PARENT_PAGE_ID");
    if (!notionToken || !parentPageId) return Response.json({ error: "내보내기 설정이 아직 완료되지 않았습니다." }, { status: 500 });
    const { data: { user }, error: userError } = await ctx.supabase.auth.getUser();
    if (userError || !user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
      const [booksResult, sentencesResult, memosResult] = await Promise.all([
        ctx.supabase.from("books").select("id, title, author, status, rating, review, started_at, finished_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        ctx.supabase.from("sentences").select("id, book_id, content, page, tags, create_at").eq("user_id", user.id).order("create_at", { ascending: true }),
        ctx.supabase.from("memos").select("id, book_id, content, page, created_at").eq("user_id", user.id).order("created_at", { ascending: true }),
      ]);
      if (booksResult.error || sentencesResult.error || memosResult.error) throw new Error("PagePick의 독서 기록을 읽지 못했습니다.");
      const books = (booksResult.data ?? []) as Book[];
      const sentences = (sentencesResult.data ?? []) as Sentence[];
      const memos = (memosResult.data ?? []) as Memo[];

      const archiveResult = await ctx.supabaseAdmin.from("notion_export_archives").select("*").eq("user_id", user.id).maybeSingle();
      if (archiveResult.error) throw archiveResult.error;
      let archive = archiveResult.data as Archive | null;
      if (archive) {
        try {
          const booksDatabase = await notionRequest<NotionDatabase>(`/databases/${archive.books_data_source_id}`, notionToken, "GET");
          if (booksDatabase.in_trash) throw new NotionResourceNotFoundError("Notion 아카이브가 휴지통에 있습니다.");
        } catch (error) {
          if (!(error instanceof NotionResourceNotFoundError)) throw error;

          const [mappingsDelete, sectionsDelete, archiveDelete] = await Promise.all([
            ctx.supabaseAdmin.from("notion_export_page_mappings").delete().eq("user_id", user.id),
            ctx.supabaseAdmin.from("notion_export_book_sections").delete().eq("user_id", user.id),
            ctx.supabaseAdmin.from("notion_export_archives").delete().eq("user_id", user.id),
          ]);
          if (mappingsDelete.error || sectionsDelete.error || archiveDelete.error) {
            throw new Error("삭제된 Notion 아카이브 정보를 초기화하지 못했습니다.");
          }
          archive = null;
        }
      }
      if (!archive) {
        const createdArchive = await createArchive(notionToken, parentPageId);
        const { data, error } = await ctx.supabaseAdmin.from("notion_export_archives").insert({ user_id: user.id, ...createdArchive }).select("*").single();
        if (error) throw error;
        archive = data as Archive;
      }
      await ensureRatingProperties(notionToken, archive.books_data_source_id);

      const [mappingsResult, sectionsResult] = await Promise.all([
        ctx.supabaseAdmin.from("notion_export_page_mappings").select("id, source_type, source_id, notion_page_id, notion_block_id").eq("user_id", user.id),
        ctx.supabaseAdmin.from("notion_export_book_sections").select("book_id, sentences_section_block_id, memos_section_block_id").eq("user_id", user.id),
      ]);
      if (mappingsResult.error || sectionsResult.error) throw new Error("동기화 정보를 읽지 못했습니다.");
      const mappingBySource = new Map(((mappingsResult.data ?? []) as PageMapping[]).map((mapping) => [`${mapping.source_type}:${mapping.source_id}`, mapping]));
      const sectionByBook = new Map(((sectionsResult.data ?? []) as BookSections[]).map((section) => [section.book_id, section]));
      const bookPageIdByBookId = new Map<number, string>();

      for (const book of books) {
        const mapping = mappingBySource.get(`book:${book.id}`);
        const result = await syncBookPage(notionToken, archive.books_data_source_id, mapping, book);
        bookPageIdByBookId.set(book.id, result.notionPageId);
        if (result.isNew) {
          const { error } = await ctx.supabaseAdmin.from("notion_export_page_mappings").insert({ user_id: user.id, source_type: "book", source_id: book.id, notion_page_id: result.notionPageId });
          if (error) throw error;
        }
        const section = await ensureBookSections(notionToken, result.notionPageId, sectionByBook.get(book.id));
        if (!sectionByBook.has(book.id)) {
          const { error } = await ctx.supabaseAdmin.from("notion_export_book_sections").insert({ user_id: user.id, book_id: book.id, sentences_section_block_id: section.sentences_section_block_id, memos_section_block_id: section.memos_section_block_id });
          if (error) throw error;
          sectionByBook.set(book.id, { ...section, book_id: book.id });
        }
      }

      const saveBlockId = async (sourceType: PageMapping["source_type"], sourceId: number, existing: PageMapping | undefined, notionBlockId: string) => {
        const query = existing
          ? ctx.supabaseAdmin.from("notion_export_page_mappings").update({ notion_block_id: notionBlockId }).eq("id", existing.id)
          : ctx.supabaseAdmin.from("notion_export_page_mappings").insert({ user_id: user.id, source_type: sourceType, source_id: sourceId, notion_block_id: notionBlockId });
        const { error } = await query;
        if (error) throw error;
      };

      for (const sentence of sentences) {
        const section = sectionByBook.get(sentence.book_id);
        if (!section || !bookPageIdByBookId.has(sentence.book_id)) continue;
        const existing = mappingBySource.get(`sentence:${sentence.id}`);
        const notionBlockId = await syncContentBlock(notionToken, section.sentences_section_block_id, existing?.notion_block_id ?? null, sentenceBlock(sentence));
        await saveBlockId("sentence", sentence.id, existing, notionBlockId);
      }
      for (const memo of memos) {
        const section = sectionByBook.get(memo.book_id);
        if (!section || !bookPageIdByBookId.has(memo.book_id)) continue;
        const existing = mappingBySource.get(`memo:${memo.id}`);
        const notionBlockId = await syncContentBlock(notionToken, section.memos_section_block_id, existing?.notion_block_id ?? null, memoBlock(memo));
        await saveBlockId("memo", memo.id, existing, notionBlockId);
      }

      const { error: updateArchiveError } = await ctx.supabaseAdmin.from("notion_export_archives").update({ last_synced_at: new Date().toISOString() }).eq("user_id", user.id);
      if (updateArchiveError) throw updateArchiveError;
      return Response.json({ url: archive.root_page_url, exported: { books: books.length, sentences: sentences.length, memos: memos.length } });
    } catch (error) {
      console.error("Notion export failed", error instanceof Error ? error.message : error);
      return Response.json({ error: error instanceof Error ? error.message : "독서 기록을 동기화하는 중 문제가 발생했습니다." }, { status: 500 });
    }
  }),
};
