import * as bookService from "@/services/bookService";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useAddBookViewModel = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUri, setCoverUri] = useState("");
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (params.title)
      setTitle(Array.isArray(params.title) ? params.title[0] : params.title);
    if (params.author)
      setAuthor(
        Array.isArray(params.author) ? params.author[0] : params.author,
      );
    if (params.image)
      setCoverUri(Array.isArray(params.image) ? params.image[0] : params.image);
    if (params.isbn)
      setIsbn(Array.isArray(params.isbn) ? params.isbn[0] : params.isbn);
  }, [params]);

  const handleAnimationFinish = () => {
    setIsSuccess(false);
    if (params.returnTo === "select-book") {
      router.back();
    } else {
      router.replace("/(tabs)/bookshelf");
    }
  };

  const handleImageAction = () => {
    Alert.alert("표지 이미지 등록", "어떤 이미지를 사용하시겠어요?", [
      { text: "갤러리에서 선택", onPress: pickImageFromLibrary },
      { text: "카메라 촬영", onPress: pickImageFromCamera },
      { text: "취소", style: "cancel" },
    ]);
  };

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("알림", "카메라 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("알림", "책 제목을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await bookService.addBook({
        title: title.trim(),
        author: author.trim(),
        cover_url: coverUri,
        isbn: isbn,
      });
      setIsSuccess(true);
    } catch (e: any) {
      Alert.alert("오류", e.message || "책 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    author,
    setAuthor,
    coverUri,
    loading,
    isSuccess,
    router,
    handleAnimationFinish,
    handleImageAction,
    handleSave,
  };
};
