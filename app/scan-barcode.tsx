import { SIZES } from "@/constants/theme";
import { useScanBarcodeViewModel } from "@/view-models/useScanBarcodeViewModel";
import { CameraView } from "expo-camera";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScanBarcodeScreen() {
  const { permission, requestPermission, handleBarcodeScanned, router } =
    useScanBarcodeViewModel();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.text}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.guideText}>책 뒷면의 바코드를 비춰주세요</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  permissionContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { color: "white", fontSize: SIZES.h3, marginBottom: SIZES.padding },
  button: {
    padding: SIZES.base * 2,
    backgroundColor: "#007AFF",
    borderRadius: SIZES.radius * 0.8,
  },
  buttonText: { color: "white", fontWeight: "bold" },
  overlay: { flex: 1 },
  topOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  middleRow: { flexDirection: "row", height: SIZES.height * 0.25 },
  sideOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  scanFrame: {
    width: SIZES.width * 0.8,
    borderColor: "transparent",
    borderWidth: 1,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: SIZES.padding * 1.25,
  },
  guideText: {
    color: "white",
    fontSize: SIZES.body3,
    fontWeight: "600",
    marginBottom: SIZES.largeTitle,
  },
  closeButton: { padding: SIZES.base },
  closeText: { color: "white", fontSize: SIZES.body3 },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIZES.padding,
    height: SIZES.padding,
    borderTopWidth: SIZES.base / 2,
    borderLeftWidth: SIZES.base / 2,
    borderColor: "#00E0FF",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: SIZES.padding,
    height: SIZES.padding,
    borderTopWidth: SIZES.base / 2,
    borderRightWidth: SIZES.base / 2,
    borderColor: "#00E0FF",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: SIZES.padding,
    height: SIZES.padding,
    borderBottomWidth: SIZES.base / 2,
    borderLeftWidth: SIZES.base / 2,
    borderColor: "#00E0FF",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: SIZES.padding,
    height: SIZES.padding,
    borderBottomWidth: SIZES.base / 2,
    borderRightWidth: SIZES.base / 2,
    borderColor: "#00E0FF",
  },
});
