import * as bookService from "@/services/bookService";
import * as sentenceService from "@/services/sentenceService";
import * as userService from "@/services/userService";
import { Book } from "@/types/book";
import { StackActions } from "@react-navigation/native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import { showToast } from "@/lib/appFeedback";

export const useSelectBookViewModel = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const content = (
    Array.isArray(params.content) ? params.content[0] : params.content
  ) as string;
  const page = (
    Array.isArray(params.page) ? params.page[0] : params.page
  ) as string;
  const tagsParam = (
    Array.isArray(params.tags) ? params.tags[0] : params.tags
  ) as string;
  const tags = tagsParam ? JSON.parse(tagsParam) : [];

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
  const [isAddBookModalVisible, setIsAddBookModalVisible] = useState(false);

  const handleCancel = useCallback(() => {
    router.replace("/(tabs)");
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();

      const onBackPress = () => {
        if (isShareMode) {
          handleCancel();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [isShareMode, handleCancel]),
  );

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.fetchBooks();
      setBooks(data);
    } catch (e) {
      console.error(e);
      showToast("책 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewBook = () => setIsAddBookModalVisible(true);

  const handleScanBarcode = () => {
    setIsAddBookModalVisible(false);
    router.push({
      pathname: "/scan-barcode",
      params: { returnTo: "select-book" },
    });
  };

  const handleManualBookEntry = () => {
    setIsAddBookModalVisible(false);
    router.push({
      pathname: "/add-book",
      params: { returnTo: "select-book" },
    });
  };

  const handleAnimationFinish = () => {
    setShowSuccess(false);
    navigation.dispatch(StackActions.popToTop());
    router.replace("/(tabs)/bookshelf");
  };

  const handleSelectBook = async (bookId: number) => {
    if (isShareMode && sharedImageUri) {
      router.push({
        pathname: `/book-detail/[id]`,
        params: {
          id: bookId,
          newPhotoUri: sharedImageUri,
          cover_url: books.find((b) => b.id === bookId)?.cover_url || "",
        },
      });
      return;
    }

    if (!content) {
      showToast("저장할 문장이 없습니다.", "error");
      return;
    }
    try {
      await sentenceService.addSentence({
        content: content,
        page: page ? parseInt(page) : null,
        book_id: bookId,
        tags: tags,
      });
      setShowSuccess(true);

      // 문장 저장 성공 후 연속 기록 업데이트
      try {
        const user = await userService.getUser();
        if (user) {
          await userService.updateUserStreak(user.id);
        }
      } catch (streakError) {
        console.error("Failed to update streak:", streakError);
        // 사용자에게는 오류를 표시하지 않음
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "문장을 저장하지 못했습니다.", "error");
    }
  };

  return {
    router,
    content,
    books,
    loading,
    showSuccess,
    isAddBookModalVisible,
    setIsAddBookModalVisible,
    fetchBooks,
    handleAddNewBook,
    handleScanBarcode,
    handleManualBookEntry,
    handleAnimationFinish,
    handleSelectBook,
    handleCancel,
  };
};
