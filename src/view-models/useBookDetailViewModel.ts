import * as bookService from "@/services/bookService";
import * as sentenceService from "@/services/sentenceService";
import { Sentence } from "@/types/sentence";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export interface BookDetailViewModelProps {
  bookId: number;
  initialTitle: string;
  initialAuthor: string;
}

export const useBookDetailViewModel = ({
  bookId,
  initialTitle,
  initialAuthor,
}: BookDetailViewModelProps) => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"book" | "sentence" | null>(
    null,
  );

  // 책 상태
  const [bookTitle, setBookTitle] = useState(initialTitle);
  const [bookAuthor, setBookAuthor] = useState(initialAuthor);
  const [bookEditModalVisible, setBookEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(initialTitle);
  const [editAuthor, setEditAuthor] = useState(initialAuthor);

  // 문장 상태
  const [sentenceEditModalVisible, setSentenceEditModalVisible] =
    useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPage, setEditPage] = useState("");

  const fetchSentences = async () => {
    try {
      setLoading(true);
      const data = await sentenceService.getSentencesByBookId(bookId);
      setSentences(data);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "문장을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (bookId) {
        fetchSentences();
      }
    }, [bookId]),
  );

  const handleAnimationFinish = () => setIsSuccess(false);

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
      { text: "책 정보 수정", onPress: openBookEditModal },
      { text: "책 삭제하기", style: "destructive", onPress: confirmDeleteBook },
      { text: "취소", style: "cancel" },
    ]);
  };

  const openBookEditModal = () => {
    setEditTitle(bookTitle);
    setEditAuthor(bookAuthor);
    setBookEditModalVisible(true);
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
      await bookService.updateBook(bookId, {
        title: editTitle,
        author: editAuthor,
      });

      setBookTitle(editTitle);
      setBookAuthor(editAuthor);
      router.setParams({ title: editTitle, author: editAuthor });

      setBookEditModalVisible(false);
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "수정에 실패했습니다.");
    }
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
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "수정에 실패했습니다.");
    }
  };

  return {
    // 상태
    sentences,
    loading,
    isSuccess,
    isDelete,
    bookTitle,
    bookAuthor,

    // 책 모달
    bookEditModalVisible,
    editTitle,
    editAuthor,
    setEditTitle,
    setEditAuthor,
    setBookEditModalVisible,

    // 문장 모달
    sentenceEditModalVisible,
    editContent,
    editPage,
    setEditContent,
    setEditPage,
    setSentenceEditModalVisible,

    // 핸들러
    handleAnimationFinish,
    handleDeleteFinish,
    handleBookOptions,
    updateBook,
    handleSentenceOptions,
    updateSentence,
  };
};
