import { deletePhoto } from "@/services/photoService";
import { router } from "expo-router";
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

  const handleDownload = () => {
    console.log("Download");
    closeMenu();
  };

  const handleShare = () => {
    console.log("Share");
    closeMenu();
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