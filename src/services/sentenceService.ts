import { supabase } from "../lib/supabase";
import { Sentence } from "../types/sentence";

// 첵 문장 불러오기
export const getSentencesByBookId = async (
  bookId: number,
): Promise<Sentence[]> => {
  const { data, error } = await supabase
    .from("sentences")
    .select("*")
    .eq("book_id", bookId)
    .order("page", { ascending: true });

  if (error) throw error;
  return data || [];
};

// 랜덤 문장 불러오기
export const getRandomSentence = async () => {
  const { data, error } = await supabase.from("sentences").select(`
      content,
      page,
      books (
        title,
        author
      )
    `);

  if (error) throw error;

  if (data && data.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomItem = data[randomIndex] as any;
    return {
      content: randomItem.content,
      source: Array.isArray(randomItem.books)
        ? randomItem.books[0]?.title
        : randomItem.books?.title || "알 수 없는 책",
      author: Array.isArray(randomItem.books)
        ? randomItem.books[0]?.author
        : randomItem.books?.author,
      page: randomItem.page,
    };
  }

  return null;
};

// 문장 추가
export const addSentence = async (sentence: {
  content: string;
  page: number | null;
  book_id: number;
  tags: string[];
}) => {
  const { error } = await supabase.from("sentences").insert([sentence]);
  if (error) throw error;
};

// 문장 수정
export const updateSentence = async (
  id: number,
  updates: { content: string; page: number | null },
) => {
  const { error } = await supabase
    .from("sentences")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

// 문장 삭제
export const deleteSentence = async (id: number) => {
  const { error } = await supabase.from("sentences").delete().eq("id", id);
  if (error) throw error;
};
