import { CameraView, useCameraPermissions } from "expo-camera";
import { Button, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  // 권한 상태
  const [permision, requestPermission] = useCameraPermissions();

  // 권한 정보 아직 로딩 중일 때
  if (!permision) {
    return <View />;
  }

  // 권한이 아직 허용되지 않았을 때
  if (!permision.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          앱을 사용하려면 카메라 권한이 필요합니다.
        </Text>
        <Button onPress={requestPermission} title="권한 허용하기" />
      </View>
    );
  }

  // 권한이 허용되었을 때
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>책을 비춰주세요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  overlayText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
});
