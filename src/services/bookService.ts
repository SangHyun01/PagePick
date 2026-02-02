import { supabase } from "../lib/supabase";
import { Book } from "../types/book";

// 이미지 업로드
const uploadImage = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    const { error } = await supabase.storage
      .from("covers")
      .upload(fileName, arrayBuffer, {
        contentType: "image/jpeg",
      });

    if (error) throw error;

    const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.error("Image upload failed", e);
    throw new Error("이미지 업로드에 실패했습니다.");
  }
};

// 책 불러오기
export const fetchBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// 책 추가
export const addBook = async (book: {
  title: string;
  author: string;
  cover_url: string;
  isbn: string;
}) => {
  if (book.isbn && book.isbn.length > 0) {
    const { data: isbnCheck } = await supabase
      .from("books")
      .select("id")
      .eq("isbn", book.isbn)
      .maybeSingle();
    if (isbnCheck) throw new Error("이미 등록된 책입니다. (ISBN)");
  } else {
    const { data: titleCheck } = await supabase
      .from("books")
      .select("id")
      .eq("title", book.title)
      .eq("author", book.author)
      .maybeSingle();
    if (titleCheck) throw new Error("이미 등록된 책입니다. (제목/저자)");
  }

  let finalCoverUrl = book.cover_url;
  if (book.cover_url && !book.cover_url.startsWith("http")) {
    finalCoverUrl = await uploadImage(book.cover_url);
  }

  const { error } = await supabase.from("books").insert([
    {
      title: book.title,
      author: book.author,
      cover_url: finalCoverUrl,
      isbn: book.isbn,
    },
  ]);

  if (error) throw error;
};

// 책 수정
export const updateBook = async (
  id: number,
  updates: { title: string; author: string },
) => {
  const { error } = await supabase.from("books").update(updates).eq("id", id);
  if (error) throw error;
};

// 책 삭제
export const deleteBook = async (id: number) => {
  const { error: sentenceError } = await supabase
    .from("sentences")
    .delete()
    .eq("book_id", id);
  if (sentenceError) throw sentenceError;

  const { error: bookError } = await supabase
    .from("books")
    .delete()
    .eq("id", id);
  if (bookError) throw bookError;
};
