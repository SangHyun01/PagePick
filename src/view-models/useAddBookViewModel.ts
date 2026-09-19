import * as bookService from "@/services/bookService";
import { BookStatus } from "@/types/book";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { showDialog, showToast } from "@/lib/appFeedback";

export const useAddBookViewModel = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUri, setCoverUri] = useState("");
  const [isbn, setIsbn] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [status, setStatus] = useState<BookStatus>("reading");
  const [startedAt, setStartedAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startedAt;
    setShowDatePicker(Platform.OS === "ios");
    setStartedAt(currentDate);
  };

  const handleImageAction = () => {
    showDialog({
      title: "표지 이미지를 추가할까요?",
      description: "이미지를 선택하거나 직접 촬영할 수 있어요.",
      actions: [
        { label: "갤러리", onPress: pickImageFromLibrary },
        { label: "카메라", onPress: pickImageFromCamera },
      ],
    });
  };

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
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
      showToast("카메라 권한이 필요합니다.", "info");
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
      showToast("책 제목을 입력해주세요.", "info");
      return;
    }

    setLoading(true);
    try {
      let bookToAdd: any = {
        title: title.trim(),
        author: author.trim(),
        cover_url: coverUri,
        isbn: isbn,
        status: status,
      };

      if (status === "reading") {
        bookToAdd.started_at = startedAt.toISOString();
      } else if (status === "finished") {
        const now = new Date().toISOString();
        bookToAdd.started_at = now;
        bookToAdd.finished_at = now;
      }

      await bookService.addBook(bookToAdd);
      setIsSuccess(true);
    } catch (e: any) {
      showToast(e.message || "책 추가에 실패했습니다.", "error");
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
    status,
    setStatus,
    startedAt,
    showDatePicker,
    setShowDatePicker,
    onChangeDate,
    handleAnimationFinish,
    handleImageAction,
    handleSave,
  };
};
