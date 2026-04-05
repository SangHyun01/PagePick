import { supabase } from "../lib/supabase";
import { Memo, InsertMemo } from "../types/memo";

// 모든 메모 불러오기
export const getMemosByBookId = async (bookId: number): Promise<Memo[]> => {
  const { data, error } = await supabase
    .from("memos")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// 메모 추가
export const addMemo = async (memo: InsertMemo) => {
  const { error } = await supabase.from("memos").insert([memo]);
  if (error) throw error;
};

// 메모 수정
export const updateMemo = async (
  id: number,
  updates: { content: string; page: string | null },
) => {
  const { error } = await supabase
    .from("memos")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

// 메모 삭제
export const deleteMemo = async (id: number) => {
  const { error } = await supabase.from("memos").delete().eq("id", id);
  if (error) throw error;
};
