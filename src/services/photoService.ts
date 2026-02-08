import { supabase } from "@/lib/supabase";
import { File } from "expo-file-system";

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
  const file = new File(uri);

  const arrayBuffer = await file.arrayBuffer();

  const filePath = `${bookId}/${new Date().getTime()}.jpg`;
  const contentType = "image/jpeg";

  const { data, error } = await supabase.storage
    .from("book_photos")
    .upload(filePath, arrayBuffer, { contentType });

  if (error) {
    throw error;
  }

  const { data: publicURLData } = supabase.storage
    .from("book_photos")
    .getPublicUrl(data.path);

  await supabase
    .from("album_photos")
    .insert({ book_id: bookId, photo_url: publicURLData.publicUrl });
};

// 사진 삭제
export const deletePhoto = async (photoUrl: string) => {
  const bucketName = "book_photos";
  // URL에서 파일 경로만 추출
  const filePath = photoUrl.split(`${bucketName}/`).pop();

  if (!filePath) {
    throw new Error("파일 경로를 찾을 수 없습니다.");
  }

  // 스토리지에서 파일 삭제
  const { error: storageError } = await supabase.storage
    .from(bucketName)
    .remove([decodeURIComponent(filePath)]);

  if (storageError) {
    console.error("스토리지 삭제 실패:", storageError);
    throw storageError;
  }

  // DB에서 레코드 삭제
  const { error: dbError } = await supabase
    .from("album_photos")
    .delete()
    .eq("photo_url", photoUrl);

  if (dbError) throw dbError;
};
