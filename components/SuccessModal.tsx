// src/components/SuccessModal.tsx
import LottieView from "lottie-react-native";
import React, { useRef } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

interface SuccessModalProps {
  visible: boolean; // 모달을 보여줄지 말지
  onFinish: () => void; // 애니메이션 끝나면 뭐 할지
  message?: string; // 밑에 띄울 메시지
  animationSource?: any;
}

export default function SuccessModal({
  visible,
  onFinish,
  message = "완료되었습니다!",
  animationSource = require("@/assets/animations/check.json"),
}: SuccessModalProps) {
  const animation = useRef<LottieView>(null);

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.lottieContainer}>
          <LottieView
            ref={animation}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
            source={animationSource}
            onAnimationFinish={onFinish}
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
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  successText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
