import { SIZES } from "@/constants/theme";
import { useScanBarcodeViewModel } from "@/view-models/useScanBarcodeViewModel";
import { CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
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
        <View style={styles.permissionIcon}>
          <Ionicons name="barcode-outline" size={31} color="#375A4E" />
        </View>
        <Text style={styles.permissionTitle}>카메라 권한이 필요해요</Text>
        <Text style={styles.permissionDescription}>
          책 뒷면의 바코드를 스캔해{`\n`}도서 정보를 빠르게 불러올 수 있어요.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>닫기</Text>
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
        <View style={styles.topOverlay}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.topCloseButton}
            accessibilityRole="button"
            accessibilityLabel="바코드 스캔 닫기"
          >
            <Ionicons name="close" size={22} color="#FFFDFC" />
          </TouchableOpacity>
        </View>
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
          <View style={styles.guideCard}>
            <View style={styles.guideIcon}>
              <Ionicons name="barcode-outline" size={20} color="#375A4E" />
            </View>
            <View style={styles.guideCopy}>
              <Text style={styles.guideTitle}>바코드를 스캔해 주세요</Text>
              <Text style={styles.guideText}>책 뒷면의 바코드가 프레임 안에 오도록 맞춰주세요.</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#F7F5F0",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding * 2,
  },
  permissionIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E8F0E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  permissionTitle: { color: "#24332D", fontSize: SIZES.h2, fontWeight: "700" },
  permissionDescription: {
    color: "#78857E",
    fontSize: SIZES.body3,
    lineHeight: 22,
    textAlign: "center",
    marginTop: SIZES.base,
    marginBottom: SIZES.padding * 1.5,
  },
  button: {
    width: "100%",
    paddingVertical: SIZES.base * 1.7,
    backgroundColor: "#375A4E",
    borderRadius: SIZES.radius * 0.8,
    alignItems: "center",
  },
  buttonText: { color: "#FFFDFC", fontWeight: "700", fontSize: SIZES.body3 },
  cancelButton: { paddingVertical: SIZES.padding },
  cancelText: { color: "#78857E", fontSize: SIZES.body3, fontWeight: "600" },
  overlay: { flex: 1 },
  topOverlay: { flex: 1, backgroundColor: "rgba(25,34,30,0.68)" },
  topCloseButton: {
    position: "absolute",
    top: SIZES.padding * 1.5,
    right: SIZES.padding * 1.25,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,253,252,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleRow: { flexDirection: "row", height: SIZES.height * 0.25 },
  sideOverlay: { flex: 1, backgroundColor: "rgba(25,34,30,0.68)" },
  scanFrame: {
    width: SIZES.width * 0.8,
    borderColor: "transparent",
    borderWidth: 1,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(25,34,30,0.68)",
    alignItems: "center",
    paddingHorizontal: SIZES.padding * 1.25,
    paddingTop: SIZES.padding * 1.5,
  },
  guideCard: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 390,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    backgroundColor: "#FFFDFC",
    alignItems: "center",
  },
  guideIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8F0E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.base * 1.5,
  },
  guideCopy: { flex: 1 },
  guideTitle: { color: "#24332D", fontSize: SIZES.body3, fontWeight: "700", marginBottom: 3 },
  guideText: {
    color: "#78857E",
    fontSize: SIZES.body4,
    lineHeight: 18,
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIZES.padding,
    height: SIZES.padding,
    borderTopWidth: SIZES.base / 2,
    borderLeftWidth: SIZES.base / 2,
    borderColor: "#91B896",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: SIZES.padding,
    height: SIZES.padding,
    borderTopWidth: SIZES.base / 2,
    borderRightWidth: SIZES.base / 2,
    borderColor: "#91B896",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: SIZES.padding,
    height: SIZES.padding,
    borderBottomWidth: SIZES.base / 2,
    borderLeftWidth: SIZES.base / 2,
    borderColor: "#91B896",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: SIZES.padding,
    height: SIZES.padding,
    borderBottomWidth: SIZES.base / 2,
    borderRightWidth: SIZES.base / 2,
    borderColor: "#91B896",
  },
});
