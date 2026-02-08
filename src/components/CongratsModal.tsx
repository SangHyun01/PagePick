import LottieView from "lottie-react-native";
import React, { useRef } from "react";
import { Modal, StyleSheet, View } from "react-native";

interface CongratsModalProps {
  visible: boolean; // 모달을 보여줄지 말지
  onFinish: () => void; // 애니메이션 끝나면 뭐 할지
}

export default function CongratsModal({
  visible,
  onFinish,
}: CongratsModalProps) {
  const animation = useRef<LottieView>(null);

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <LottieView
          ref={animation}
          autoPlay
          loop={false}
          style={styles.lottieAnimation}
          source={require("@/assets/animations/Congrats.json")}
          onAnimationFinish={onFinish}
          resizeMode="cover"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
  },
});
