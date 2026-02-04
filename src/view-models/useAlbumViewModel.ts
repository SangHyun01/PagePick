import { fetchPhotos, uploadPhoto } from "@/services/photoService";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

interface AlbumViewModelProps {
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
}

export const useAlbumViewModel = ({
  bookId,
  bookTitle,
  bookAuthor,
}: AlbumViewModelProps) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsLoading(true);
      try {
        // 여러 장을 한 번에 업로드
        await Promise.all(
          result.assets.map((asset) => uploadPhoto(bookId, asset.uri)),
        );
        await loadPhotos(); // 새로고침
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePhotoPress = (photo: any) => {
    router.push({
      pathname: "/photo-detail",
      params: {
        photo_url: photo.photo_url,
        bookTitle,
        bookAuthor,
      },
    });
  };

  return { photos, isLoading, loadPhotos, pickAndUpload, handlePhotoPress };
};
