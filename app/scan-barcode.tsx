import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScanBarcodeScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false); // 중복 스캔 방지

  // 카메라 권한 확인
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 네이버 책 검색 함수
  const searchBookByIsbn = async (isbn: string) => {
    const CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
    const CLIENT_SECRET = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET;

    console.log(`📸 스캔된 바코드 번호: ${isbn}`);

    if (!isbn.startsWith("978") && !isbn.startsWith("979")) {
      Alert.alert(
        "알림",
        `ISBN 바코드가 아닌 것 같습니다.\n(스캔된 번호: ${isbn})\n978로 시작하는 바코드를 찍어주세요.`
      );
      setScanned(false);
      return;
    }

    try {
      const response = await fetch(
        `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(
          isbn
        )}&display=1`,
        {
          headers: {
            "X-Naver-Client-Id": CLIENT_ID || "",
            "X-Naver-Client-Secret": CLIENT_SECRET || "",
          },
        }
      );

      const data = await response.json();

      console.log("API 응답 결과:", JSON.stringify(data, null, 2));

      if (data.items && data.items.length > 0) {
        const book = data.items[0];
        router.replace({
          pathname: "/add-book",
          params: {
            title: book.title,
            author: book.author,
            image: book.image,
            isbn: isbn,
            description: book.description,
          },
        });
      } else {
        // 결과가 비어있을 때
        Alert.alert(
          "알림",
          "정보를 찾을 수 없는 책입니다.\n직접 입력하시겠습니까?",
          [
            { text: "다시 스캔", onPress: () => setScanned(false) },
            { text: "직접 입력", onPress: () => router.replace("/add-book") },
          ]
        );
      }
    } catch (error) {
      console.error("API 에러:", error);
      Alert.alert("오류", "네트워크 에러가 발생했습니다.", [
        { text: "확인", onPress: () => setScanned(false) },
      ]);
    }
  };

  // 바코드 인식 이벤트 핸들러
  const handleBarcodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return; // 이미 스캔했으면 무시

    setScanned(true); // 스캔 잠금
    searchBookByIsbn(data);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8"],
        }}
      />

      {/* 가이드라인 UI (사용자가 어디에 대야 할지 알려줌) */}
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
  text: { color: "white", fontSize: 18, marginBottom: 20 },
  button: { padding: 15, backgroundColor: "#007AFF", borderRadius: 10 },
  buttonText: { color: "white", fontWeight: "bold" },

  // 오버레이 스타일 (검은 반투명 배경 + 가운데 투명 구멍)
  overlay: { flex: 1 },
  topOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  middleRow: { flexDirection: "row", height: 200 }, // 스캔 영역 높이
  sideOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  scanFrame: { width: 300, borderColor: "transparent", borderWidth: 1 },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 30,
  },

  guideText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 50,
  },
  closeButton: { padding: 10 },
  closeText: { color: "white", fontSize: 16 },

  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00E0FF",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#00E0FF",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#00E0FF",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#00E0FF",
  },
});
