export type BookStatus = "reading" | "finished" | "wish";

export interface Book {
  id: number;
  title: string;
  cover_url: string;
  author?: string;
  isbn?: string;
  status: BookStatus;
  rating?: number | null;
  review?: string | null;
  created_at?: string;
  started_at?: string;
  finished_at?: string;
}
