import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 사진 찍기 함수
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        console.log("찍은 사진:", photo.uri);
        Alert.alert("찰칵! 📸", "사진이 찍혔습니다!");

        console.log("글자 읽는 중...");
        const result = await TextRecognition.recognize(
          photo.uri,
          TextRecognitionScript.KOREAN
        );

        // 결과 확인
        console.log("전체 텍스트:", result.text);

        Alert.alert(`글자를 찾았습니다!\n\n${result.text.slice(0, 50)}...`);
      } catch (error) {
        console.error(error);
        Alert.alert("글자를 읽어오지 못했습니다.");
      }
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라 권한이 필요합니다.</Text>
        <Button onPress={requestPermission} title="권한 허용하기" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.overlay}>
        <Text style={styles.guideText}>문장이 잘 보이게 찍어주세요</Text>
        <View style={styles.shutterContainer}>
          <TouchableOpacity
            onPress={takePicture}
            style={styles.shutterButtonOuter}
          >
            <View style={styles.shutterButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: "white",
  },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  guideText: {
    color: "white",
    marginBottom: 20,
    fontSize: 14,
    fontWeight: "600",
  },
  shutterContainer: { marginBottom: 30 },
  shutterButtonOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  shutterButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
  },
});
