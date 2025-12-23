import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import { CameraView, useCameraPermissions } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
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
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // 1. 상태 변수들
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrBlocks, setOcrBlocks] = useState<any[]>([]);

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

        setOcrBlocks(result.blocks || []);

        if (result.blocks.length === 0) {
          Alert.alert("알림", "글자를 찾지 못했습니다.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("오류", "문제가 발생했습니다.");
      }
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setOcrBlocks([]);
    setImageSize({ width: 0, height: 0 }); // 초기화
  };

  let isLogPrinted = false;

  const getAdjustedFrame = (frame: any, index: number) => {
    // 정보가 없으면 그냥 0 반환
    if (imageSize.width === 0 || viewSize.width === 0) return frame;

    // 1. 축소 비율(Scale) 계산
    const scaleX = viewSize.width / imageSize.width;
    const scaleY = viewSize.height / imageSize.height;
    const scale = Math.min(scaleX, scaleY);

    // 2. 실제로 화면에 그려진 이미지 크기 계산
    const displayedWidth = imageSize.width * scale;
    const displayedHeight = imageSize.height * scale;

    // 3. 검은 여백(Offset) 계산 (가운데 정렬 때문에 생김)
    const offsetX = (viewSize.width - displayedWidth) / 2;
    const offsetY = (viewSize.height - displayedHeight) / 2;

    if (index === 0 && !isLogPrinted) {
      isLogPrinted = true;
      console.log("---------------------------------");
      console.log(`📸 원본 크기: ${imageSize.width} x ${imageSize.height}`);
      console.log(`📱 화면 크기: ${viewSize.width} x ${viewSize.height}`);
      console.log(`📐 계산된 비율(scale): ${scale.toFixed(4)}`);
      console.log(`↔️ X축 여백(offsetX): ${offsetX.toFixed(2)}`);
      console.log(`↕️ Y축 여백(offsetY): ${offsetY.toFixed(2)}`);
      console.log("---------------------------------");
    }

    // 4. 최종 좌표 계산 (원본좌표 * 비율 + 여백)
    return {
      left: frame.left * scale + offsetX,
      top: frame.top * scale + offsetY,
      width: frame.width * scale,
      height: frame.height * scale,
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
        <Image
          source={{ uri: capturedImage }}
          style={styles.previewImage}
          resizeMode="contain"
          onLayout={(event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout;
            setViewSize({ width, height });
          }}
        />

        {/* 변환된 좌표로 박스 그리기 */}
        {ocrBlocks.map((block, index) => {
          // 변환된 좌표 가져오기
          const frame = getAdjustedFrame(block.frame, index);
          return (
            <View
              key={index}
              style={{
                position: "absolute",
                left: frame.left,
                top: frame.top,
                width: frame.width,
                height: frame.height,
                borderWidth: 2,
                borderColor: "#00ff00", // 잘 보이게 초록색
                backgroundColor: "rgba(0, 255, 0, 0.2)",
              }}
            />
          );
        })}

        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={resetCamera} style={styles.cancelButton}>
            <Text style={styles.buttonText}>다시 찍기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.buttonText}>저장하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  //
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
  },
  cancelButton: { padding: 15, backgroundColor: "#555", borderRadius: 10 },
  saveButton: { padding: 15, backgroundColor: "#007AFF", borderRadius: 10 },
  buttonText: { color: "white", fontWeight: "bold" },
});
