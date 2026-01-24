import SuccessModal from "@/components/SuccessModal";
import { supabase } from "@/lib/supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SIZES } from "@/constants/theme";

interface Sentence {
  id: number;
  content: string;
  page: number;
  create_at: string;
}

export default function BookDetailScreen() {
  // 책장에서 넘겨준 책 정보
  const params = useLocalSearchParams();
  const bookId = params.id;
  const bookTitle = params.title as string;
  const bookAuthor = params.author as string;
  const coverUrl = params.cover_url as string;

  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  // 책 정보 수정
  const [bookEditModalVisible, setBookEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(bookTitle);
  const [editAuthor, setEditAuthor] = useState(bookAuthor);

  // 기록된 문장 수정
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [editContent, setEditContent] = useState(""); // 수정할 문장 내용
  const [editPage, setEditPage] = useState(""); // 수정할 페이지 번호

  const [deleteTarget, setDeleteTarget] = useState<"book" | "sentence" | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      if (bookId) {
        fetchSentences();
      }
    }, [bookId]),
  );

  const handleAnimationFinish = () => {
    setIsSuccess(false);
  };

  const handleDeleteFinish = () => {
    setIsDelete(false);

    if (deleteTarget === "book") {
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/(tabs)/bookshelf");
    }
  };

  const fetchSentences = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("sentences")
        .select("*")
        .eq("book_id", bookId)
        .order("page", { ascending: true });

      if (error) throw error;

      if (data) {
        setSentences(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 책 관리 메뉴
  const handleBookOptions = () => {
    Alert.alert("책 관리", "이 책을 어떻게 하시겠어요?", [
      {
        text: "책 정보 수정",
        onPress: () => {
          setEditTitle(bookTitle);
          setEditAuthor(bookAuthor);
          setBookEditModalVisible(true);
        },
      },
      {
        text: "책 삭제하기",
        style: "destructive",
        onPress: confirmDeleteBook,
      },
      { text: "취소", style: "cancel" },
    ]);
  };

  // 책 삭제
  const confirmDeleteBook = () => {
    Alert.alert(
      "경고",
      "책을 삭제하면 저장된 모든 문장들도 모두 사라집니다.\n정말 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // 문장들 먼저 삭제
              await supabase.from("sentences").delete().eq("book_id", bookId);

              // 책 삭제
              const { error } = await supabase
                .from("books")
                .delete()
                .eq("id", bookId);

              if (error) throw error;
              setDeleteTarget("book");
              setIsDelete(true);
            } catch (e) {
              Alert.alert("오류", "책 삭제에 실패했습니다.");
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // 책 정보 수정
  const handleUpdateBook = async () => {
    if (!editTitle.trim()) {
      Alert.alert("알림", "책 제목을 입력해주세요.");
      return;
    }

    try {
      const { error } = await supabase
        .from("books")
        .update({ title: editTitle, author: editAuthor })
        .eq("id", bookId);

      if (error) throw error;

      setBookEditModalVisible(false);
      setIsSuccess(true);

      router.setParams({ title: editTitle, author: editAuthor });
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "수정에 실패했습니다.");
    }
  };

  // 수정 메뉴 버튼
  const handleOptionPress = (sentence: Sentence) => {
    Alert.alert(
      "문장 관리",
      "원하시는 작업을 선택하세요.",
      [
        {
          text: "수정하기",
          onPress: () => openEditModal(sentence),
        },
        {
          text: "삭제하기",
          onPress: () => confirmDelete(sentence.id),
          style: "destructive",
        },
        {
          text: "취소",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  };

  // 삭제
  const confirmDelete = (id: number) => {
    Alert.alert("삭제 확인", "정말 이 문장을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("sentences")
              .delete()
              .eq("id", id);
            if (error) throw error;
            // 리스트에서 바로 제거
            setSentences((prev) => prev.filter((s) => s.id !== id));
            setDeleteTarget("sentence");
            setIsDelete(true);
          } catch (e) {
            Alert.alert("오류", "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  // 수정 모달
  const openEditModal = (sentence: Sentence) => {
    setEditingSentence(sentence);
    setEditContent(sentence.content);
    setEditPage(sentence.page ? sentence.page.toString() : "");
    setModalVisible(true);
  };

  // 수정 내용 저장
  const handleUpdate = async () => {
    if (!editingSentence) return;
    if (!editContent.trim()) {
      Alert.alert("알림", "문장 내용을 입력해주세요.");
      return;
    }

    try {
      const { error } = await supabase
        .from("sentences")
        .update({
          content: editContent,
          page: editPage ? parseInt(editPage) : null,
        })
        .eq("id", editingSentence.id);

      if (error) throw error;

      setSentences((prev) =>
        prev.map((s) =>
          s.id === editingSentence.id
            ? {
                ...s,
                content: editContent,
                page: editPage ? parseInt(editPage) : 0,
              }
            : s,
        ),
      );

      setModalVisible(false);
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "수정에 실패했습니다.");
    }
  };

  const renderSentenceItem = ({ item }: { item: Sentence }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.quoteIcon}>
          <FontAwesome
            name="quote-left"
            size={SIZES.h2}
            color="#007AFF"
            style={{ opacity: 0.3 }}
          />
        </View>
        <TouchableOpacity
          onPress={() => handleOptionPress(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={SIZES.h2} color="#999" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sentenceText}>{item.content}</Text>

      <View style={styles.pageContainer}>
        <Text style={styles.pageText}>p.{item.page}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            아카이브
          </Text>
        </View>
        <View style={{ width: 28, paddingHorizontal: 10 }} />

        <TouchableOpacity onPress={handleBookOptions} style={{ padding: 5 }}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 책 정보 간략 표시 */}
      <View style={styles.bookInfoSection}>
        {coverUrl && (
          <Image source={{ uri: coverUrl }} style={styles.smallCover} />
        )}
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>{bookTitle}</Text>
          <Text style={styles.infoAuthor}>{bookAuthor}</Text>
          <Text style={styles.infoCount}>수집한 문장 {sentences.length}개</Text>
        </View>
      </View>

      {/* 문장 리스트 */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={sentences}
          renderItem={renderSentenceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>아직 저장된 문장이 없습니다.</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={bookEditModalVisible}
        onRequestClose={() => setBookEditModalVisible(false)}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>책 정보 수정</Text>

            <Text style={styles.label}>책 제목</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
            />

            <Text style={styles.label}>저자</Text>
            <TextInput
              style={styles.input}
              value={editAuthor}
              onChangeText={setEditAuthor}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setBookEditModalVisible(false)}
              >
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleUpdateBook}
              >
                <Text style={styles.btnTextSave}>수정 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>문장 수정하기</Text>

            <Text style={styles.label}>문장 내용</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              textAlignVertical="top"
              placeholder="문장을 입력하세요"
            />

            <Text style={styles.label}>페이지</Text>
            <TextInput
              style={styles.input}
              value={editPage}
              onChangeText={setEditPage}
              keyboardType="number-pad"
              placeholder="페이지 번호"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleUpdate}
              >
                <Text style={styles.btnTextSave}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <SuccessModal
        visible={isSuccess}
        onFinish={handleAnimationFinish}
        message="수정 완료!"
      />

      <SuccessModal
        visible={isDelete}
        onFinish={handleDeleteFinish}
        message="삭제 완료"
        animationSource={require("@/assets/animations/delete.json")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.base * 2,
    paddingHorizontal: SIZES.base * 2,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: { padding: SIZES.base / 2 },

  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: SIZES.base,
  },

  // 제목 텍스트
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: "#333",
  },

  bookInfoSection: {
    flexDirection: "row",
    padding: SIZES.padding,
    backgroundColor: "#fff",
    marginBottom: SIZES.base,
  },
  smallCover: {
    width: SIZES.largeTitle,
    height: SIZES.largeTitle * 1.5,
    borderRadius: SIZES.base / 2,
    marginRight: SIZES.base * 2,
    backgroundColor: "#eee",
  },
  infoText: { justifyContent: "center", flex: 1 },
  infoTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.base / 2,
  },
  infoAuthor: {
    fontSize: SIZES.body4,
    color: "#666",
    marginBottom: SIZES.base / 2,
  },
  infoCount: { fontSize: SIZES.body4, color: "#007AFF", fontWeight: "600" },

  listContent: { padding: SIZES.base * 2 },

  // 문장 카드 스타일
  card: {
    backgroundColor: "#fff",
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base * 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.base,
  },
  quoteIcon: { marginBottom: SIZES.base },
  sentenceText: {
    fontSize: SIZES.body3,
    lineHeight: SIZES.h2,
    color: "#333",
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  pageContainer: {
    alignItems: "flex-end",
    marginTop: SIZES.base * 1.5,
  },
  pageText: {
    fontSize: SIZES.font,
    color: "#888",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
    overflow: "hidden",
  },

  emptyContainer: { alignItems: "center", marginTop: SIZES.largeTitle },
  emptyText: { color: "#999", fontSize: SIZES.body3 },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // 반투명 배경
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.padding,
    textAlign: "center",
  },
  label: {
    fontSize: SIZES.body4,
    fontWeight: "600",
    color: "#666",
    marginBottom: SIZES.base * 0.75,
    marginTop: SIZES.base,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: SIZES.radius,
    padding: SIZES.base * 1.5,
    fontSize: SIZES.body3,
  },
  textArea: { height: 100, textAlignVertical: "top" }, // 여러 줄 입력 가능
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.padding,
  },
  btn: {
    flex: 1,
    padding: SIZES.base * 1.8,
    borderRadius: SIZES.radius,
    alignItems: "center",
  },
  btnCancel: { backgroundColor: "#f0f0f0", marginRight: SIZES.base },
  btnSave: { backgroundColor: "#007AFF" },
  btnTextCancel: { color: "#666", fontWeight: "bold" },
  btnTextSave: { color: "white", fontWeight: "bold" },
});
