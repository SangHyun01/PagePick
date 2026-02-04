import AlbumList from "@/components/AlbumList";
import SentenceList from "@/components/SentenceList";
import SuccessModal from "@/components/SuccessModal";
import { Colors, SIZES } from "@/constants/theme"; // Colors import 추가
import { useAlbumViewModel } from "@/view-models/useAlbumViewModel";
import { useBookDetailViewModel } from "@/view-models/useBookDetailViewModel";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
  const [activeTab, setActiveTab] = useState<"sentence" | "album">("sentence");

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

  const { photos, pickAndUpload, isLoading, handlePhotoPress } =
    useAlbumViewModel({
      bookId: Number(bookId),
      bookTitle,
      bookAuthor,
    });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            아카이브
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleBookOptions}
          style={styles.settingsButton}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={Colors.light.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bookInfoSection}>
        {coverUrl && (
          <Image source={{ uri: coverUrl }} style={styles.smallCover} />
        )}
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>{bookTitle}</Text>
          <Text style={styles.infoAuthor}>{bookAuthor}</Text>
          <View style={styles.infoCountContainer}>
            <Text style={styles.infoCount}>
              수집한 문장 {sentences.length}개
            </Text>
            <Text style={styles.infoCountDivider}>|</Text>
            <Text style={styles.infoCount}>
              업로드한 사진 {photos.length}개
            </Text>
          </View>
        </View>
      </View>

      {/* 탭 버튼 (문장 / 앨범) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "sentence" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("sentence")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sentence" && styles.activeTabText,
            ]}
          >
            문장
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "album" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("album")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "album" && styles.activeTabText,
            ]}
          >
            앨범
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <View style={styles.content}>
          {activeTab === "sentence" ? (
            <SentenceList
              sentences={sentences}
              onOptionPress={handleSentenceOptions}
            />
          ) : (
            <AlbumList
              photos={photos}
              onAddPress={pickAndUpload}
              isLoading={isLoading}
              onPhotoPress={handlePhotoPress}
            />
          )}
        </View>
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
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.base * 2,
    paddingHorizontal: SIZES.base * 2,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    color: Colors.light.text,
  },
  settingsButton: {
    padding: 5,
  },
  bookInfoSection: {
    flexDirection: "row",
    padding: SIZES.padding,
    backgroundColor: Colors.light.background,
    marginBottom: SIZES.base,
  },
  smallCover: {
    width: SIZES.largeTitle,
    height: SIZES.largeTitle * 1.5,
    borderRadius: SIZES.base / 2,
    marginRight: SIZES.base * 2,
    backgroundColor: "#f0f0f0",
  },
  infoText: { justifyContent: "center", flex: 1 },
  infoTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.base / 2,
    color: Colors.light.text,
  },
  infoAuthor: {
    fontSize: SIZES.body4,
    color: Colors.light.icon,
    marginBottom: SIZES.base / 2,
  },
  infoCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoCount: {
    fontSize: SIZES.body4,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  infoCountDivider: {
    fontSize: SIZES.body4,
    color: Colors.light.icon,
    marginHorizontal: SIZES.base,
  },
  listContent: { padding: SIZES.base * 2 },
  card: {
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  pageContainer: {
    alignItems: "flex-end",
    marginTop: SIZES.base * 1.5,
  },
  pageText: {
    fontSize: SIZES.font,
    color: Colors.light.icon,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
    overflow: "hidden",
  },
  emptyContainer: { alignItems: "center", marginTop: SIZES.largeTitle },
  emptyText: { color: Colors.light.icon, fontSize: SIZES.body3 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  label: {
    fontSize: SIZES.body4,
    fontWeight: "600",
    color: Colors.light.icon,
    marginBottom: SIZES.base * 0.75,
    marginTop: SIZES.base,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: SIZES.radius,
    padding: SIZES.base * 1.5,
    fontSize: SIZES.body3,
    color: Colors.light.text,
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
  btnSave: { backgroundColor: Colors.light.tint },
  btnTextCancel: { color: Colors.light.icon, fontWeight: "bold" },
  btnTextSave: { color: Colors.light.background, fontWeight: "bold" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: SIZES.base * 1.8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: SIZES.body3,
    color: Colors.light.icon,
    fontWeight: "600",
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: "bold",
  },
});
