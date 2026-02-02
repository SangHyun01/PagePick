import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Image, LayoutChangeEvent } from "react-native";

export const useCameraViewModel = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrLines, setOcrLines] = useState<any[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        shutterSound: false,
        quality: 0.8,
      });
      if (!photo) return;

      const manipResult = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 900 } }],
        { format: SaveFormat.JPEG },
      );

      setCapturedImage(manipResult.uri);
      Image.getSize(manipResult.uri, (width, height) => {
        setImageSize({ width, height });
      });

      const result = await TextRecognition.recognize(
        manipResult.uri,
        TextRecognitionScript.KOREAN,
      );

      const allLines: any[] =
        result.blocks?.flatMap((block) => block.lines) || [];
      setOcrLines(allLines);
      setSelectedIndices([]);
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "사진 처리 중 문제가 발생했습니다.");
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setOcrLines([]);
    setImageSize({ width: 0, height: 0 });
    setSelectedIndices([]);
  };

  const handleLinePress = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleComplete = async () => {
    if (selectedIndices.length === 0) {
      Alert.alert("알림", "저장할 문장을 터치해서 선택해주세요.");
      return;
    }

    const selectedText = selectedIndices
      .sort((a, b) => a - b)
      .map((index) => ocrLines[index].text)
      .join(" ");

    await Clipboard.setStringAsync(selectedText);
    router.push({
      pathname: "/write",
      params: { text: selectedText },
    });
  };

  const getAdjustedFrame = (frame: any) => {
    if (imageSize.width === 0 || viewSize.width === 0) return frame;

    const scaleX = viewSize.width / imageSize.width;
    const scaleY = viewSize.height / imageSize.height;
    const scale = Math.max(scaleX, scaleY);
    const displayedWidth = imageSize.width * scale;
    const displayedHeight = imageSize.height * scale;

    const offsetX = (viewSize.width - displayedWidth) / 2;
    const offsetY = (viewSize.height - displayedHeight) / 2;

    return {
      left: frame.left * scale + offsetX,
      top: frame.top * scale + offsetY,
      width: frame.width * scale,
      height: frame.height * scale,
    };
  };

  const onImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewSize({ width, height });
  };

  return {
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
  };
};
