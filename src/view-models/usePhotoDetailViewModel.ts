import { deletePhoto } from "@/services/photoService";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert } from "react-native";

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
    Alert.alert("사진 삭제", "정말로 이 사진을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePhoto(photoUrl);
            Alert.alert("성공", "사진이 삭제되었습니다.");
            router.back();
          } catch (error) {
            console.error(error);
            Alert.alert("오류", "사진을 삭제하는 데 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 갤러리에 다운로드
  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "권한 거부됨",
          "사진을 저장하려면 앨범 접근 권한을 허용해주세요.",
        );
        return;
      }

      // 다운로드 할 로컬 경로 생성(임시 폴더 + 파일명)
      const fileName = photoUrl.split("/").pop() || `photo_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(photoUrl, fileUri);

      await MediaLibrary.createAssetAsync(uri);

      Alert.alert("저장 완료", "사진이 앨범에 저장되었습니다.");
    } catch (error: any) {
      console.error(error);
      Alert.alert("실패", "다운로드 중 오류가 발생했습니다.");
    }
  };

  // 사진 공유
  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("알림", "이 기기에서는 공유 기능을 사용할 수 없습니다.");
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
      Alert.alert("실패", "공유하는 중 오류가 발생했습니다.");
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
