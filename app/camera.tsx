import { SIZES } from "@/constants/theme";
import { useCameraViewModel } from "@/view-models/useCameraViewModel";
import { CameraView } from "expo-camera";
import {
  Button,
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
        <Text style={styles.message}>카메라 권한이 필요합니다.</Text>
        <Button onPress={requestPermission} title="권한 허용하기" />
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
                    ? "rgba(255, 255, 0, 0.4)"
                    : "transparent",
                  borderColor: isSelected ? "#E6B800" : "transparent",
                  borderWidth: 1,
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
            <Text style={styles.buttonText}>다시 찍기</Text>
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
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1, backgroundColor: "black" },
  message: {
    textAlign: "center",
    paddingBottom: SIZES.base,
    fontSize: SIZES.body3,
    color: "white",
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
    backgroundColor: "#555",
    borderRadius: SIZES.radius * 0.8,
    width: SIZES.width * 0.35,
    alignItems: "center",
  },
  saveButton: {
    padding: SIZES.base * 2,
    backgroundColor: "#007AFF",
    borderRadius: SIZES.radius * 0.8,
    width: SIZES.width * 0.35,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: SIZES.body3 },
});
