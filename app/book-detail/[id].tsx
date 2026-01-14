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

  // 기록된 문장 수정
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [editContent, setEditContent] = useState(""); // 수정할 문장 내용
  const [editPage, setEditPage] = useState(""); // 수정할 페이지 번호

  useFocusEffect(
    useCallback(() => {
      if (bookId) {
        fetchSentences();
      }
    }, [bookId])
  );

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
      { cancelable: true }
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
            : s
        )
      );

      setModalVisible(false);
      Alert.alert("성공", "문장이 수정되었습니다.");
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
            size={20}
            color="#007AFF"
            style={{ opacity: 0.3 }}
          />
        </View>
        <TouchableOpacity
          onPress={() => handleOptionPress(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#999" />
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
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: { padding: 4 },

  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },

  // 제목 텍스트
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  bookInfoSection: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  smallCover: {
    width: 50,
    height: 75,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: "#eee",
  },
  infoText: { justifyContent: "center", flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  infoAuthor: { fontSize: 14, color: "#666", marginBottom: 4 },
  infoCount: { fontSize: 12, color: "#007AFF", fontWeight: "600" },

  listContent: { padding: 16 },

  // 문장 카드 스타일
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  quoteIcon: { marginBottom: 8 },
  sentenceText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  pageContainer: {
    alignItems: "flex-end",
    marginTop: 12,
  },
  pageText: {
    fontSize: 12,
    color: "#888",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#999", fontSize: 16 },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // 반투명 배경
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" }, // 여러 줄 입력 가능
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center" },
  btnCancel: { backgroundColor: "#f0f0f0", marginRight: 10 },
  btnSave: { backgroundColor: "#007AFF" },
  btnTextCancel: { color: "#666", fontWeight: "bold" },
  btnTextSave: { color: "white", fontWeight: "bold" },
});
