import LottieView from "lottie-react-native";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { SIZES } from "../constants/theme";

interface LoadingModalProps {
  visible: boolean;
  message?: string;
}

export default function LoadingModal({
  visible,
  message = "처리 중...",
}: LoadingModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.lottieContainer}>
          <LottieView
            autoPlay
            loop
            style={styles.lottieAnimation}
            source={require("@/assets/animations/Book Loader.json")}
          />
          <Text style={styles.loadingText}>{message}</Text>
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
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
