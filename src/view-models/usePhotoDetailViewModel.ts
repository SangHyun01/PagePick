import { useState } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export const usePhotoDetailViewModel = () => {
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

  return {
    isMenuVisible,
    animatedStyle,
    openMenu,
    closeMenu,
  };
};