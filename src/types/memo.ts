export interface Memo {
  id: number;
  user_id: string;
  book_id: number;
  page: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export type InsertMemo = Omit<Memo, "id" | "created_at" | "updated_at">;
