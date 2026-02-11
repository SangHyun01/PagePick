import * as bookService from "@/services/bookService";
import * as sentenceService from "@/services/sentenceService";
import { Book, BookStatus } from "@/types/book";
import { Sentence } from "@/types/sentence";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export interface BookDetailViewModelProps {
  bookId: number;
}

export const useBookDetailViewModel = ({
  bookId,
}: BookDetailViewModelProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"book" | "sentence" | null>(
    null,
  );
  const [successType, setSuccessType] = useState<"default" | "review">(
    "default",
  );

  // 책 정보 수정 모달
  const [bookEditModalVisible, setBookEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  // 문장 수정 모달
  const [sentenceEditModalVisible, setSentenceEditModalVisible] =
    useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPage, setEditPage] = useState("");

  // 리뷰 작성 모달
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");

  // 리뷰 수정/조회 모달
  const [isReviewEditModalVisible, setReviewEditModalVisible] = useState(false);
  const [editingRating, setEditingRating] = useState(0);
  const [editingReview, setEditingReview] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookData, sentencesData] = await Promise.all([
        bookService.getBookById(bookId),
        sentenceService.getSentencesByBookId(bookId),
      ]);

      if (bookData) {
        setBook(bookData);
        setEditTitle(bookData.title);
        setEditAuthor(bookData.author || "");
      }
      setSentences(sentencesData);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (bookId) {
        fetchData();
      }
    }, [bookId]),
  );

  const handleAnimationFinish = () => {
    setIsSuccess(false);
    setSuccessType("default");
  };

  const handleDeleteFinish = () => {
    setIsDelete(false);
    if (deleteTarget === "book") {
      if (router.canDismiss()) router.dismissAll();
      router.replace("/(tabs)/bookshelf");
    }
  };

  // 책 관련 이벤트
  const handleBookOptions = () => {
    Alert.alert("책 관리", "이 책을 어떻게 하시겠어요?", [
      { text: "책 정보 수정", onPress: () => setBookEditModalVisible(true) },
      { text: "책 삭제하기", style: "destructive", onPress: confirmDeleteBook },
      { text: "취소", style: "cancel" },
    ]);
  };

  const confirmDeleteBook = () => {
    Alert.alert(
      "경고",
      "책을 삭제하면 저장된 모든 문장들도 모두 사라집니다.\n정말 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: deleteBook },
      ],
    );
  };

  const deleteBook = async () => {
    try {
      setLoading(true);
      await bookService.deleteBook(bookId);
      setDeleteTarget("book");
      setIsDelete(true);
      setLoading(false);
    } catch (e) {
      Alert.alert("오류", "책 삭제에 실패했습니다.");
      setLoading(false);
    }
  };

  const updateBook = async () => {
    if (!editTitle.trim()) {
      Alert.alert("알림", "책 제목을 입력해주세요.");
      return;
    }
    try {
      await bookService.updateBookDetails(bookId, {
        title: editTitle,
        author: editAuthor,
      });
      setBook((prev) =>
        prev ? { ...prev, title: editTitle, author: editAuthor } : null,
      );
      router.setParams({ title: editTitle, author: editAuthor });
      setBookEditModalVisible(false);
      setSuccessType("default");
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "수정에 실패했습니다.");
    }
  };

  const handleUpdateStatus = async (status: BookStatus) => {
    // 읽고 싶은 책 -> 읽는 중 (최초 한번만)
    if (
      book?.status === "wish" &&
      status === "reading" &&
      !book.started_at
    ) {
      Alert.alert("알림", "오늘부터 읽으시겠습니까?", [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "확인",
          onPress: async () => {
            try {
              const updates: Partial<Book> = {
                status: "reading",
                started_at: new Date().toISOString(),
              };
              await bookService.updateBookDetails(bookId, updates);
              setBook((prev) => (prev ? { ...prev, ...updates } : null));
            } catch (error) {
              console.error("Failed to update book status:", error);
              Alert.alert("오류", "책 상태 변경에 실패했습니다.");
            }
          },
        },
      ]);
    } else if (status === "finished" && !book?.finished_at) {
      setReviewModalVisible(true);
    } else {
      try {
        await bookService.updateBookDetails(bookId, { status });
        setBook((prev) => (prev ? { ...prev, status } : null));
      } catch (error) {
        console.error("Failed to update book status:", error);
        Alert.alert("오류", "책 상태 변경에 실패했습니다.");
      }
    }
  };

  // 리뷰 관련 이벤트
  const handleSubmitReview = async () => {
    if (newRating === 0) {
      Alert.alert("알림", "별점을 선택해주세요.");
      return;
    }
    try {
      const updates: Partial<Book> = {
        status: "finished",
        rating: newRating,
        review: newReview,
      };
      if (!book?.finished_at) {
        updates.finished_at = new Date().toISOString();
      }
      await bookService.updateBookDetails(bookId, updates);
      setBook((prev) => (prev ? { ...prev, ...updates } : null));
      setReviewModalVisible(false);
      setNewRating(0);
      setNewReview("");
      setSuccessType("review");
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to submit review:", error);
      Alert.alert("오류", "리뷰 등록에 실패했습니다.");
    }
  };

  const handleCancelReview = () => {
    setReviewModalVisible(false);
    setNewRating(0);
    setNewReview("");
    if (book) {
      setBook({ ...book, status: "reading" });
    }
  };

  const openReviewEditModal = () => {
    if (book?.rating && book.review) {
      setEditingRating(book.rating);
      setEditingReview(book.review);
    }
    setReviewEditModalVisible(true);
  };

  const handleUpdateReview = async () => {
    if (editingRating === 0) {
      Alert.alert("알림", "별점을 선택해주세요.");
      return;
    }
    try {
      const updates = {
        rating: editingRating,
        review: editingReview,
      };
      await bookService.updateBookDetails(bookId, updates);
      setBook((prev) => (prev ? { ...prev, ...updates } : null));
      setReviewEditModalVisible(false);
      setSuccessType("default");
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to update review:", error);
      Alert.alert("오류", "리뷰 수정에 실패했습니다.");
    }
  };

  const handleDeleteReview = async () => {
    Alert.alert("리뷰 삭제", "정말 리뷰를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const updates = {
              rating: null,
              review: null,
            };
            await bookService.updateBookDetails(bookId, updates);
            setBook((prev) => (prev ? { ...prev, ...updates } : null));
            setReviewEditModalVisible(false);
          } catch (error) {
            console.error("Failed to delete review:", error);
            Alert.alert("오류", "리뷰 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 문장 관련 이벤트
  const handleSentenceOptions = (sentence: Sentence) => {
    Alert.alert(
      "문장 관리",
      "원하시는 작업을 선택하세요.",
      [
        { text: "수정하기", onPress: () => openSentenceEditModal(sentence) },
        {
          text: "삭제하기",
          onPress: () => confirmDeleteSentence(sentence.id),
          style: "destructive",
        },
        { text: "취소", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const openSentenceEditModal = (sentence: Sentence) => {
    setEditingSentence(sentence);
    setEditContent(sentence.content);
    setEditPage(sentence.page ? sentence.page.toString() : "");
    setSentenceEditModalVisible(true);
  };

  const confirmDeleteSentence = (id: number) => {
    Alert.alert("삭제 확인", "정말 이 문장을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => deleteSentence(id) },
    ]);
  };

  const deleteSentence = async (id: number) => {
    try {
      await sentenceService.deleteSentence(id);
      setSentences((prev) => prev.filter((s) => s.id !== id));
      setDeleteTarget("sentence");
      setIsDelete(true);
    } catch (e) {
      Alert.alert("오류", "삭제에 실패했습니다.");
    }
  };

  const updateSentence = async () => {
    if (!editingSentence || !editContent.trim()) {
      Alert.alert("알림", "문장 내용을 입력해주세요.");
      return;
    }
    try {
      const updatedPage = editPage ? parseInt(editPage) : null;
      await sentenceService.updateSentence(editingSentence.id, {
        content: editContent,
        page: updatedPage,
      });
      setSentences((prev) =>
        prev.map((s) =>
          s.id === editingSentence.id
            ? { ...s, content: editContent, page: updatedPage ?? 0 }
            : s,
        ),
      );
      setSentenceEditModalVisible(false);
      setSuccessType("default");
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "수정에 실패했습니다.");
    }
  };

  return {
    // 상태
    book,
    sentences,
    loading,
    isSuccess,
    isDelete,
    successType,

    // 책 정보 수정 모달
    bookEditModalVisible,
    editTitle,
    editAuthor,
    setEditTitle,
    setEditAuthor,
    setBookEditModalVisible,

    // 문장 수정 모달
    sentenceEditModalVisible,
    editContent,
    editPage,
    setEditContent,
    setEditPage,
    setSentenceEditModalVisible,

    // 리뷰 작성 모달
    isReviewModalVisible,
    setReviewModalVisible,
    newRating,
    newReview,
    setNewRating,
    setNewReview,

    // 리뷰 수정/조회 모달
    isReviewEditModalVisible,
    setReviewEditModalVisible,
    editingRating,
    setEditingRating,
    editingReview,
    setEditingReview,

    // 핸들러
    handleAnimationFinish,
    handleDeleteFinish,
    handleBookOptions,
    updateBook,
    handleUpdateStatus,
    handleSentenceOptions,
    updateSentence,
    handleSubmitReview,
    handleCancelReview,
    openReviewEditModal,
    handleUpdateReview,
    handleDeleteReview,
  };
};
