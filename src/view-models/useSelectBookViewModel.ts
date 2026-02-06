import * as bookService from "@/services/bookService";
import * as sentenceService from "@/services/sentenceService";
import { Book } from "@/types/book";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export const useSelectBookViewModel = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const content = (
    Array.isArray(params.content) ? params.content[0] : params.content
  ) as string;
  const page = (
    Array.isArray(params.page) ? params.page[0] : params.page
  ) as string;

  // 공유 기능용 파라미터 받기
  const sharedImageUri = (
    Array.isArray(params.sharedImageUri)
      ? params.sharedImageUri[0]
      : params.sharedImageUri
  ) as string;

  const isShareMode =
    (Array.isArray(params.isShareMode)
      ? params.isShareMode[0]
      : params.isShareMode) === "true";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, []),
  );

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.fetchBooks();
      setBooks(data);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "책 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewBook = () => {
    Alert.alert("새 책 추가", "어떤 방법으로 추가하시겠어요?", [
      {
        text: "바코드 스캔",
        onPress: () =>
          router.push({
            pathname: "/scan-barcode",
            params: { returnTo: "select-book" },
          }),
      },
      {
        text: "직접 입력",
        onPress: () =>
          router.push({
            pathname: "/add-book",
            params: { returnTo: "select-book" },
          }),
      },
      { text: "취소", style: "cancel" },
    ]);
  };

  const handleAnimationFinish = () => {
    setShowSuccess(false);
    router.replace("/(tabs)/bookshelf");
  };

  const handleSelectBook = async (bookId: number) => {
    if (isShareMode && sharedImageUri) {
      router.replace({
        pathname: `/book-detail/[id]`,
        params: {
          id: bookId,
          newPhotoUri: sharedImageUri,
        },
      });
      return;
    }

    if (!content) {
      Alert.alert("오류", "저장할 문장이 없습니다.");
      return;
    }
    try {
      await sentenceService.addSentence({
        content: content,
        page: page ? parseInt(page) : null,
        book_id: bookId,
      });
      setShowSuccess(true);
    } catch (e: any) {
      console.error(e);
      Alert.alert("저장 실패", e.message);
    }
  };

  return {
    router,
    content,
    books,
    loading,
    showSuccess,
    fetchBooks,
    handleAddNewBook,
    handleAnimationFinish,
    handleSelectBook,
  };
};
