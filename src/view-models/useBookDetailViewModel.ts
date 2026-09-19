import * as bookService from "@/services/bookService";
import * as memoService from "@/services/memoService";
import * as sentenceService from "@/services/sentenceService";
import * as userService from "@/services/userService";
import { Book, BookStatus } from "@/types/book";
import { Memo } from "@/types/memo";
import { Sentence } from "@/types/sentence";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { showDialog, showToast } from "@/lib/appFeedback";

export interface BookDetailViewModelProps {
  bookId: number;
}

export const useBookDetailViewModel = ({
  bookId,
}: BookDetailViewModelProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    "book" | "sentence" | "memo" | null
  >(null);
  const [successType, setSuccessType] = useState<"default" | "review">(
    "default",
  );

  // 책 정보 수정 모달
  const [bookEditModalVisible, setBookEditModalVisible] = useState(false);
  const [isBookOptionsModalVisible, setIsBookOptionsModalVisible] =
    useState(false);
  const [isBookDeleteConfirmVisible, setIsBookDeleteConfirmVisible] =
    useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  // 문장 수정 모달
  const [sentenceEditModalVisible, setSentenceEditModalVisible] =
    useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPage, setEditPage] = useState("");
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [selectedSentenceForOptions, setSelectedSentenceForOptions] =
    useState<Sentence | null>(null);

  // 메모 수정 모달
  const [memoEditModalVisible, setMemoEditModalVisible] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoContent, setMemoContent] = useState("");
  const [memoPage, setMemoPage] = useState("");
  const [selectedMemoForOptions, setSelectedMemoForOptions] =
    useState<Memo | null>(null);

  // 메모 추가 모달
  const [isMemoAddModalVisible, setMemoAddModalVisible] = useState(false);
  const [newMemoContent, setNewMemoContent] = useState("");
  const [newMemoPage, setNewMemoPage] = useState("");

  // 리뷰 작성 모달
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");

  // 리뷰 수정/조회 모달
  const [isReviewEditModalVisible, setReviewEditModalVisible] = useState(false);
  const [editingRating, setEditingRating] = useState(0);
  const [editingReview, setEditingReview] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookData, sentencesData, memosData] = await Promise.all([
        bookService.getBookById(bookId),
        sentenceService.getSentencesByBookId(bookId),
        memoService.getMemosByBookId(bookId),
      ]);

      if (bookData) {
        setBook(bookData);
        setEditTitle(bookData.title);
        setEditAuthor(bookData.author || "");
      }
      setSentences(sentencesData);
      setMemos(memosData);
    } catch (e) {
      console.error(e);
      showToast("데이터를 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      if (bookId) {
        fetchData();
      }
    }, [bookId, fetchData]),
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
    setIsBookOptionsModalVisible(true);
  };

  const openBookEditModal = () => {
    setIsBookOptionsModalVisible(false);
    setBookEditModalVisible(true);
  };

  const handleBookDeleteRequest = () => {
    setIsBookOptionsModalVisible(false);
    setIsBookDeleteConfirmVisible(true);
  };

  const cancelBookDelete = () => {
    setIsBookDeleteConfirmVisible(false);
  };

  const confirmBookDelete = () => {
    setIsBookDeleteConfirmVisible(false);
    deleteBook();
  };

  const deleteBook = async () => {
    try {
      setLoading(true);
      await bookService.deleteBook(bookId);
      setDeleteTarget("book");
      setIsDelete(true);
      setLoading(false);
    } catch (e) {
      console.error(e);
      showToast("책 삭제에 실패했습니다.", "error");
      setLoading(false);
    }
  };

  const updateBook = async () => {
    if (!editTitle.trim()) {
      showToast("책 제목을 입력해주세요.", "info");
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
      showToast("수정에 실패했습니다.", "error");
    }
  };

  const handleUpdateStatus = async (status: BookStatus) => {
    // 읽고 싶은 책 -> 읽는 중 (최초 한번만)
    if (book?.status === "wish" && status === "reading" && !book.started_at) {
      showDialog({
        title: "읽기를 시작할까요?",
        description: "오늘을 독서 시작일로 기록할게요.",
        actions: [
          { label: "취소" },
          {
            label: "시작하기",
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
              showToast("책 상태 변경에 실패했습니다.", "error");
            }
            },
          },
        ],
      });
    } else if (status === "finished" && !book?.finished_at) {
      setReviewModalVisible(true);
    } else {
      try {
        await bookService.updateBookDetails(bookId, { status });
        setBook((prev) => (prev ? { ...prev, status } : null));
      } catch (error) {
        console.error("Failed to update book status:", error);
        showToast("책 상태 변경에 실패했습니다.", "error");
      }
    }
  };

  // 리뷰 관련 이벤트
  const handleSubmitReview = async () => {
    if (newRating === 0) {
      showToast("별점을 선택해주세요.", "info");
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
      showToast("리뷰 등록에 실패했습니다.", "error");
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
      showToast("별점을 선택해주세요.", "info");
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
      showToast("리뷰 수정에 실패했습니다.", "error");
    }
  };

  const handleDeleteReview = async () => {
    showDialog({
      title: "리뷰를 삭제할까요?",
      description: "삭제한 리뷰는 되돌릴 수 없어요.",
      actions: [
        { label: "취소" },
        {
          label: "삭제하기",
          tone: "destructive",
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
            showToast("리뷰 삭제에 실패했습니다.", "error");
          }
          },
        },
      ],
    });
  };

  // 문장 관련 이벤트
  const handleSentenceOptions = (sentence: Sentence) => {
    setSelectedSentenceForOptions(sentence);
  };

  const closeSentenceOptions = () => setSelectedSentenceForOptions(null);

  const editSelectedSentence = () => {
    if (!selectedSentenceForOptions) return;
    const sentence = selectedSentenceForOptions;
    closeSentenceOptions();
    openSentenceEditModal(sentence);
  };

  const deleteSelectedSentence = () => {
    if (!selectedSentenceForOptions) return;
    const id = selectedSentenceForOptions.id;
    closeSentenceOptions();
    confirmDeleteSentence(id);
  };

  const openSentenceEditModal = (sentence: Sentence) => {
    setEditingSentence(sentence);
    setEditContent(sentence.content);
    setEditPage(sentence.page ? sentence.page.toString() : "");
    setEditingTags(sentence.tags || []);
    setSentenceEditModalVisible(true);
  };

  const confirmDeleteSentence = (id: number) => {
    showDialog({
      title: "문장을 삭제할까요?",
      description: "삭제한 문장은 되돌릴 수 없어요.",
      actions: [
        { label: "취소" },
        { label: "삭제하기", tone: "destructive", onPress: () => deleteSentence(id) },
      ],
    });
  };

  const deleteSentence = async (id: number) => {
    try {
      await sentenceService.deleteSentence(id);
      setSentences((prev) => prev.filter((s) => s.id !== id));
      setDeleteTarget("sentence");
      setIsDelete(true);
    } catch (e) {
      console.error(e);
      showToast("삭제에 실패했습니다.", "error");
    }
  };

  const updateSentence = async () => {
    if (!editingSentence || !editContent.trim()) {
      showToast("문장 내용을 입력해주세요.", "info");
      return;
    }
    try {
      const updatedPage = editPage ? parseInt(editPage) : null;
      await sentenceService.updateSentence(editingSentence.id, {
        content: editContent,
        page: updatedPage,
        tags: editingTags,
      });
      setSentences((prev) =>
        prev.map((s) =>
          s.id === editingSentence.id
            ? {
                ...s,
                content: editContent,
                page: updatedPage ?? 0,
                tags: editingTags,
              }
            : s,
        ),
      );
      setSentenceEditModalVisible(false);
      setSuccessType("default");
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      showToast("수정에 실패했습니다.", "error");
    }
  };

  const handleEditingTagSelect = (tag: string) => {
    setEditingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // 메모 관련 이벤트
  const handleMemoOptions = (memo: Memo) => {
    setSelectedMemoForOptions(memo);
  };

  const closeMemoOptions = () => setSelectedMemoForOptions(null);

  const editSelectedMemo = () => {
    if (!selectedMemoForOptions) return;
    const memo = selectedMemoForOptions;
    closeMemoOptions();
    openMemoEditModal(memo);
  };

  const deleteSelectedMemo = () => {
    if (!selectedMemoForOptions) return;
    const id = selectedMemoForOptions.id;
    closeMemoOptions();
    confirmDeleteMemo(id);
  };

  const openMemoEditModal = (memo: Memo) => {
    setEditingMemo(memo);
    setMemoContent(memo.content);
    setMemoPage(memo.page ? memo.page.toString() : "");
    setMemoEditModalVisible(true);
  };

  const confirmDeleteMemo = (id: number) => {
    showDialog({
      title: "메모를 삭제할까요?",
      description: "삭제한 메모는 되돌릴 수 없어요.",
      actions: [
        { label: "취소" },
        { label: "삭제하기", tone: "destructive", onPress: () => deleteMemo(id) },
      ],
    });
  };

  const deleteMemo = async (id: number) => {
    try {
      await memoService.deleteMemo(id);
      setMemos((prev) => prev.filter((m) => m.id !== id));
      setDeleteTarget("memo");
      setIsDelete(true);
    } catch (e) {
      console.error(e);
      showToast("삭제에 실패했습니다.", "error");
    }
  };

  const updateMemo = async () => {
    if (!editingMemo || !memoContent.trim()) {
      showToast("메모 내용을 입력해주세요.", "info");
      return;
    }
    try {
      const updatedPage = memoPage.trim() || null;
      await memoService.updateMemo(editingMemo.id, {
        content: memoContent,
        page: updatedPage,
      });
      setMemos((prev) =>
        prev.map((m) =>
          m.id === editingMemo.id
            ? {
                ...m,
                content: memoContent,
                page: updatedPage,
              }
            : m,
        ),
      );
      setMemoEditModalVisible(false);
      setSuccessType("default");
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      showToast("수정에 실패했습니다.", "error");
    }
  };

  const addMemo = async () => {
    if (!newMemoContent.trim()) {
      showToast("메모 내용을 입력해주세요.", "info");
      return;
    }
    try {
      const user = await userService.getUser();
      if (!user) throw new Error("User not authenticated");

      const pageStr = newMemoPage.trim() || null;
      await memoService.addMemo({
        content: newMemoContent,
        page: pageStr,
        book_id: bookId,
        user_id: user.id,
      });

      // 새로고침 대신 상태 업데이트
      const memosData = await memoService.getMemosByBookId(bookId);
      setMemos(memosData);

      setMemoAddModalVisible(false);
      setNewMemoContent("");
      setNewMemoPage("");
    } catch (e) {
      console.error(e);
      showToast("메모 저장에 실패했습니다.", "error");
    }
  };

  return {
    // 상태
    book,
    sentences,
    memos,
    loading,
    isSuccess,
    isDelete,
    successType,

    // 책 정보 수정 모달
    bookEditModalVisible,
    isBookOptionsModalVisible,
    isBookDeleteConfirmVisible,
    editTitle,
    editAuthor,
    setEditTitle,
    setEditAuthor,
    setBookEditModalVisible,
    setIsBookOptionsModalVisible,

    // 문장 수정 모달
    sentenceEditModalVisible,
    selectedSentenceForOptions,
    editContent,
    editPage,
    editingTags,
    setEditContent,
    setEditPage,
    setSentenceEditModalVisible,

    // 메모 수정 모달
    memoEditModalVisible,
    selectedMemoForOptions,
    memoContent,
    memoPage,
    setMemoContent,
    setMemoPage,
    setMemoEditModalVisible,

    // 메모 추가 모달
    isMemoAddModalVisible,
    newMemoContent,
    newMemoPage,
    setNewMemoContent,
    setNewMemoPage,
    setMemoAddModalVisible,

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
    openBookEditModal,
    handleBookDeleteRequest,
    cancelBookDelete,
    confirmBookDelete,
    updateBook,
    handleUpdateStatus,
    handleSentenceOptions,
    closeSentenceOptions,
    editSelectedSentence,
    deleteSelectedSentence,
    updateSentence,
    handleMemoOptions,
    closeMemoOptions,
    editSelectedMemo,
    deleteSelectedMemo,
    updateMemo,
    addMemo,
    handleSubmitReview,
    handleCancelReview,
    openReviewEditModal,
    handleUpdateReview,
    handleDeleteReview,
    handleEditingTagSelect,
  };
};
