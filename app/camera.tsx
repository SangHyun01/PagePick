import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 상태 변수들
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrLines, setOcrLines] = useState<any[]>([]);

  // 선택된 줄의 인덱스
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // 드래그 충돌 감지용 좌표 저장소
  const boxRects = useRef<any[]>([]);

  // 원본 사진의 크기 (너비, 높이)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  // 화면에 보이는 이미지 영역의 크기
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });

  // 사진 찍기 함수
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

        const manipResult = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 900 } }], // 너비 900으로 줄이기
          { format: SaveFormat.JPEG }
        );

        // 결과 저장
        setCapturedImage(manipResult.uri);

        // 사진의 원본 크기
        Image.getSize(manipResult.uri, (width, height) => {
          setImageSize({ width, height });
        });

        console.log("글자 읽는 중...");
        const result = await TextRecognition.recognize(
          manipResult.uri,
          TextRecognitionScript.KOREAN
        );

        // 블록을 줄 단위로 쪼개서 저장
        const allLines: any[] = [];
        result.blocks?.forEach((block) => {
          block.lines.forEach((line) => {
            allLines.push(line);
          });
        });

        setOcrLines(allLines);
        setSelectedIndices([]);
      } catch (error) {
        console.error(error);
        Alert.alert("오류", "문제가 발생했습니다.");
      }
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setOcrLines([]);
    setImageSize({ width: 0, height: 0 }); // 초기화
    setSelectedIndices([]);
    boxRects.current = [];
  };

  // 터치로 라인 선택/해제하는 함수
  const handleLinePress = (index: number) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        // 이미 선택된 경우, 선택 해제
        return prev.filter((i) => i !== index);
      } else {
        // 선택되지 않은 경우, 선택 추가
        return [...prev, index];
      }
    });
  };

  const handleComplete = async () => {
    if (selectedIndices.length === 0) {
      Alert.alert("알림", "저장할 문장을 터치해서 선택해주세요.");
      return;
    }

    // 선택된 줄들을 순서대로 합침
    const selectedText = selectedIndices
      .sort((a, b) => a - b)
      .map((index) => ocrLines[index].text)
      .join(" "); // 줄바꿈 대신 공백으로 연결

    // 클립보드 복사
    await Clipboard.setStringAsync(selectedText);

    // 글쓰기 화면으로 이동
    router.push({
      pathname: "/write",
      params: { text: selectedText },
    });
  };

  const getAdjustedFrame = (frame: any) => {
    // 정보가 없으면 그냥 0 반환
    if (imageSize.width === 0 || viewSize.width === 0) return frame;

    // 축소 비율 계산
    const scaleX = viewSize.width / imageSize.width;
    const scaleY = viewSize.height / imageSize.height;
    const scale = Math.min(scaleX, scaleY);

    // 실제로 화면에 그려진 이미지 크기 계산
    const displayedWidth = imageSize.width * scale;
    const displayedHeight = imageSize.height * scale;

    // 검은 여백 계산
    const offsetX = (viewSize.width - displayedWidth) / 2;
    const offsetY = (viewSize.height - displayedHeight) / 2;

    // 최종 좌표 계산 (원본좌표 * 비율 + 여백)
    return {
      left: frame.left * scale + offsetX,
      top: frame.top * scale + offsetY,
      width: frame.width * scale,
      height: frame.height * scale,
      // 충돌 감지용 우측/하단 좌표 추가
      right: (frame.left + frame.width) * scale + offsetX,
      bottom: (frame.top + frame.height) * scale + offsetY,
    };
  };

  // 화면 렌더링
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라 권한이 필요합니다.</Text>
        <Button onPress={requestPermission} title="권한 허용하기" />
      </View>
    );
  }

  // 결과 화면
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: capturedImage }}
            style={styles.previewImage}
            resizeMode="contain"
            onLayout={(event: LayoutChangeEvent) => {
              const { width, height } = event.nativeEvent.layout;
              setViewSize({ width, height });
            }}
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
                  // 선택되면 노란색 형광펜
                  backgroundColor: isSelected
                    ? "rgba(255, 255, 0, 0.4)"
                    : "transparent",
                  // 테두리는 없거나 아주 옅게
                  borderColor: isSelected ? "#E6B800" : "transparent",
                  borderWidth: 1,
                  borderRadius: 4,
                }}
              />
            );
          })}
        </View>

        {/* 하단 버튼 바 */}
        <View style={styles.bottomBar}>
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

  // 촬영 화면
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

  previewImage: { width: "100%", height: "100%", backgroundColor: "black" },
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
  bottomBar: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    zIndex: 20, // 버튼이 형광펜보다 위에 있게
  },
  cancelButton: {
    padding: 15,
    backgroundColor: "#555",
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
  saveButton: {
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
