export type BookStatus = "reading" | "finished" | "wish";

export interface Book {
  id: number;
  title: string;
  cover_url: string;
  author?: string;
  status: BookStatus;
}
