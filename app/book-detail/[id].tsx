import SuccessModal from "@/components/SuccessModal";
import { SIZES } from "@/constants/theme";
import { Sentence } from "@/types/sentence";
import { useBookDetailViewModel } from "@/view-models/useBookDetailViewModel";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
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

export default function BookDetailScreen() {
  const params = useLocalSearchParams();
  const bookId = Number(params.id);
  const coverUrl = params.cover_url as string;

  const {
    sentences,
    loading,
    isSuccess,
    isDelete,
    bookTitle,
    bookAuthor,
    bookEditModalVisible,
    editTitle,
    editAuthor,
    setEditTitle,
    setEditAuthor,
    setBookEditModalVisible,
    sentenceEditModalVisible,
    editContent,
    editPage,
    setEditContent,
    setEditPage,
    setSentenceEditModalVisible,
    handleAnimationFinish,
    handleDeleteFinish,
    handleBookOptions,
    updateBook,
    handleSentenceOptions,
    updateSentence,
  } = useBookDetailViewModel({
    bookId,
    initialTitle: params.title as string,
    initialAuthor: params.author as string,
  });

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
          onPress={() => handleSentenceOptions(item)}
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
        <TouchableOpacity onPress={handleBookOptions} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

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

      {/* 책 정보 수정 모달 */}
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
                onPress={updateBook}
              >
                <Text style={styles.btnTextSave}>수정 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 문장 수정 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sentenceEditModalVisible}
        onRequestClose={() => setSentenceEditModalVisible(false)}
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
                onPress={() => setSentenceEditModalVisible(false)}
              >
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={updateSentence}
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
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: "#333",
  },
  settingsButton: {
    padding: 5,
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
  textArea: { height: 100, textAlignVertical: "top" },
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
