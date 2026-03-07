import LottieView from "lottie-react-native";
import React, { useRef, useEffect } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { SIZES } from "../constants/theme";

interface StreakRewardModalProps {
  visible: boolean;
  onFinish: () => void;
  message?: string;
}

export default function StreakRewardModal({
  visible,
  onFinish,
  message = "보상을 획득했습니다!",
}: StreakRewardModalProps) {
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    let timer: number;
    if (visible) {
      timer = setTimeout(() => {
        onFinish();
      }, 3000); // 3초 후에 모달 닫기
    }
    return () => {
      clearTimeout(timer);
    };
  }, [visible, onFinish]);

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.lottieContainer}>
          <LottieView
            ref={animation}
            autoPlay
            loop={false}
            style={styles.lottieAnimation}
            source={require("@/assets/animations/shield.json")}
          />
          <Text style={styles.successText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  lottieContainer: {
    width: SIZES.width * 0.7,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  lottieAnimation: {
    width: "100%",
    aspectRatio: 1,
  },
  successText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
