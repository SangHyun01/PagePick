import { supabase } from "@/lib/supabase";

// 사진 목록 가져오기
export const fetchPhotos = async (bookId: number) => {
  const { data, error } = await supabase
    .from("album_photos")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// 사진 업로드
export const uploadPhoto = async (bookId: number, uri: string) => {
  // 파일 이름 생성
  const fileName = `${bookId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from("book_photos")
    .upload(fileName, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });
  if (error) throw error;

  // 업로드된 URL 가져오기
  const { data: publicData } = supabase.storage
    .from("book_photos")
    .getPublicUrl(fileName);

  // DB에 정보 저장
  const { error: dbError } = await supabase
    .from("album_photos")
    .insert({ book_id: bookId, photo_url: publicData.publicUrl });

  if (dbError) throw dbError;
};
