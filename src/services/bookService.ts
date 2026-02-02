import { supabase } from "../lib/supabase";
import { Book } from "../types/book";

// 책 불러오기
export const fetchBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// 책 정보 수정
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
