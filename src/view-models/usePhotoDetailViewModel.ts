import { deletePhoto } from "@/services/photoService";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { showDialog, showToast } from "@/lib/appFeedback";

import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface PhotoDetailViewModelProps {
  photoUrl: string;
}

export const usePhotoDetailViewModel = ({
  photoUrl,
}: PhotoDetailViewModelProps) => {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const translateY = useSharedValue(300);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const openMenu = () => {
    setMenuVisible(true);
    translateY.value = withTiming(0);
  };

  const closeMenu = () => {
    translateY.value = withTiming(300);
    setTimeout(() => {
      setMenuVisible(false);
    }, 200);
  };

  // 사진 삭제
  const handleDelete = async () => {
    closeMenu();
    showDialog({
      title: "사진을 삭제할까요?",
      description: "삭제한 사진은 되돌릴 수 없어요.",
      actions: [
        { label: "취소" },
        {
          label: "삭제하기",
          tone: "destructive",
          onPress: async () => {
          try {
            await deletePhoto(photoUrl);
            showToast("사진을 삭제했어요.", "success");
            router.back();
          } catch (error) {
            console.error(error);
            showToast("사진을 삭제하지 못했습니다.", "error");
          }
          },
        },
      ],
    });
  };

  // 갤러리에 다운로드
  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        showToast("사진을 저장하려면 앨범 접근 권한이 필요합니다.", "info");
        return;
      }

      // 다운로드 할 로컬 경로 생성(임시 폴더 + 파일명)
      const fileName = photoUrl.split("/").pop() || `photo_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(photoUrl, fileUri);

      await MediaLibrary.createAssetAsync(uri);

      showToast("사진을 앨범에 저장했어요.", "success");
    } catch (error: any) {
      console.error(error);
      showToast("다운로드 중 오류가 발생했습니다.", "error");
    }
  };

  // 사진 공유
  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showToast("이 기기에서는 공유 기능을 사용할 수 없습니다.", "info");
        return;
      }

      // 임시 캐시 폴더에 파일 다운로드
      const fileName = photoUrl.split("/").pop() || `share_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(photoUrl, fileUri);

      // 공유 창 띄우기
      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: "사진 공유하기",
        UTI: "public.jpeg",
      });
    } catch (error) {
      console.error("공유 실패:", error);
      showToast("공유하는 중 오류가 발생했습니다.", "error");
    } finally {
      closeMenu();
    }
  };

  return {
    isMenuVisible,
    animatedStyle,
    openMenu,
    closeMenu,
    handleDelete,
    handleDownload,
    handleShare,
  };
};
