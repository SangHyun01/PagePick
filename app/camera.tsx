import { SIZES } from "@/constants/theme";
import { useCameraViewModel } from "@/view-models/useCameraViewModel";
import { Ionicons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const {
    permission,
    requestPermission,
    cameraRef,
    capturedImage,
    ocrLines,
    selectedIndices,
    takePicture,
    resetCamera,
    handleLinePress,
    handleComplete,
    getAdjustedFrame,
    onImageLayout,
  } = useCameraViewModel();

  if (!permission) {
    return <View style={styles.permissionContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={30} color="#375A4E" />
          </View>
          <Text style={styles.permissionTitle}>카메라 권한이 필요해요</Text>
          <Text style={styles.message}>
            책 속 문장을 촬영해{`\n`}손쉽게 기록할 수 있어요.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>권한 허용하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: capturedImage }}
            style={styles.previewImage}
            resizeMode="cover"
            onLayout={onImageLayout}
          />
          {ocrLines.map((line, index) => {
            const frame = getAdjustedFrame(line.frame);
            const isSelected = selectedIndices.includes(index);
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => handleLinePress(index)}
                style={{
                  position: "absolute",
                  left: frame.left,
                  top: frame.top,
                  width: frame.width,
                  height: frame.height,
                  backgroundColor: isSelected
                    ? "rgba(145, 184, 150, 0.36)"
                    : "transparent",
                  borderColor: isSelected ? "#375A4E" : "transparent",
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: 4,
                }}
              />
            );
          })}
        </View>
        <View
          style={[
            styles.bottomBar,
            { bottom: SIZES.padding * 1.25 + insets.bottom },
          ]}
        >
          <TouchableOpacity onPress={resetCamera} style={styles.cancelButton}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>다시 찍기</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleComplete} style={styles.saveButton}>
            <Text style={styles.buttonText}>
              {selectedIndices.length > 0 ? "선택 완료" : "문장 터치"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        animateShutter={false}
      />
      <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
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
  permissionContainer: {
    flex: 1,
    backgroundColor: "#F7F5F0",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  permissionCard: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    padding: SIZES.padding * 1.5,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    backgroundColor: "#FFFEFA",
    shadowColor: "#24332D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  permissionIcon: {
    width: SIZES.padding * 3,
    height: SIZES.padding * 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.padding * 1.5,
    backgroundColor: "#E8F0E9",
    marginBottom: SIZES.padding,
  },
  permissionTitle: {
    color: "#24332D",
    fontSize: SIZES.h3,
    fontWeight: "700",
  },
  container: { flex: 1, backgroundColor: "black" },
  message: {
    textAlign: "center",
    paddingTop: SIZES.base,
    fontSize: SIZES.body4,
    lineHeight: SIZES.body4 * 1.55,
    color: "#78857E",
  },
  permissionButton: {
    alignSelf: "stretch",
    alignItems: "center",
    marginTop: SIZES.padding,
    paddingVertical: SIZES.padding * 0.65,
    borderRadius: SIZES.radius,
    backgroundColor: "#375A4E",
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: SIZES.body3,
    fontWeight: "700",
  },
  camera: { flex: 1 },
  previewImage: { width: "100%", height: "100%", backgroundColor: "black" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SIZES.height * 0.2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  guideText: {
    color: "white",
    marginBottom: SIZES.padding,
    fontSize: SIZES.body4,
    fontWeight: "600",
  },
  shutterContainer: { marginBottom: SIZES.padding * 1.25 },
  shutterButtonOuter: {
    width: SIZES.padding * 3,
    height: SIZES.padding * 3,
    borderRadius: SIZES.padding * 1.5,
    borderWidth: SIZES.base / 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  shutterButtonInner: {
    width: SIZES.padding * 2.2,
    height: SIZES.padding * 2.2,
    borderRadius: SIZES.padding * 1.1,
    backgroundColor: "white",
  },
  bottomBar: {
    position: "absolute",
    bottom: SIZES.padding * 1.25,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    zIndex: 20,
  },
  cancelButton: {
    padding: SIZES.base * 2,
    backgroundColor: "rgba(255, 253, 252, 0.92)",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: SIZES.radius * 0.8,
    width: SIZES.width * 0.35,
    alignItems: "center",
  },
  saveButton: {
    padding: SIZES.base * 2,
    backgroundColor: "#375A4E",
    borderRadius: SIZES.radius * 0.8,
    width: SIZES.width * 0.35,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: SIZES.body3 },
  cancelButtonText: { color: "#405148" },
});
