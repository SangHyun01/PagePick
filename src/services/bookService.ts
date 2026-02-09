import { supabase } from "../lib/supabase";
import { Book } from "../types/book";

// 네이버 책 검색 API
export const searchBookByIsbn = async (isbn: string) => {
  const CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
  const CLIENT_SECRET = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET;

  if (!isbn.startsWith("978") && !isbn.startsWith("979")) {
    throw new Error(`ISBN 바코드가 아닌 것 같습니다.\n(스캔된 번호: ${isbn})`);
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(
        isbn,
      )}&display=1`,
      {
        headers: {
          "X-Naver-Client-Id": CLIENT_ID || "",
          "X-Naver-Client-Secret": CLIENT_SECRET || "",
        },
      },
    );

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Naver API Error:", error);
    throw new Error("네트워크 에러가 발생했습니다.");
  }
};

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

// 책 상세 정보 업데이트 (제목, 저자, 상태, 리뷰 등)
export const updateBookDetails = async (
  id: number,
  updates: Partial<Book>,
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

// 책 상태 업데이트
export const updateBookStatus = async (id: number, status: string) => {
  const { error } = await supabase
    .from("books")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
};

// 책 ID로 책 정보 가져오기
export const getBookById = async (id: number): Promise<Book | null> => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching book by id:", error);
    throw error;
  }
  return data;
};
