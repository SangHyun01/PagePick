import { supabase } from "../lib/supabase";
import { Sentence } from "../types/sentence";
import { getUser, recalculateStreakAndLastReadDate } from "./userService";

// 모든 문장 불러오기
export const getAllUserSentences = async (): Promise<Sentence[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("sentences")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;
  return data || [];
};

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
  updates: { content: string; page: number | null; tags: string[] },
) => {
  const { error } = await supabase
    .from("sentences")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

// 문장 삭제
export const deleteSentence = async (id: number) => {
  const user = await getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase.from("sentences").delete().eq("id", id);
  if (error) throw error;

  await recalculateStreakAndLastReadDate(user.id);
};
