import { fetchPhotos, uploadPhoto } from "@/services/photoService";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const useAlbumViewModel = (bookId: number) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // 사진 로딩
  const loadPhotos = useCallback(async () => {
    const data = await fetchPhotos(bookId);
    setPhotos(data || []);
  }, [bookId]);

  // 화면 들어올때마다 사진 로딩
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );

  // 사진 추가
  const pickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        // 여러 장을 한 번에 업로드
        await Promise.all(
          result.assets.map((asset) => uploadPhoto(bookId, asset.uri)),
        );
        await loadPhotos(); // 새로고침
      } catch (e) {
        console.error(e);
      } finally {
        setUploading(false);
      }
    }
  };

  return { photos, uploading, loadPhotos, pickAndUpload };
};
