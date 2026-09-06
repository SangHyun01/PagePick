import AlbumList from "@/components/AlbumList";
import CongratsModal from "@/components/CongratsModal";
import MemoList from "@/components/MemoList";
import SentenceList from "@/components/SentenceList";
import SuccessModal from "@/components/SuccessModal";
import { SIZES } from "@/constants/theme";
import { BookStatus } from "@/types/book";
import { useAlbumViewModel } from "@/view-models/useAlbumViewModel";
import { useBookDetailViewModel } from "@/view-models/useBookDetailViewModel";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const STATUS_MAP: Record<BookStatus, string> = {
  wish: "읽을 책",
  reading: "읽는 중",
  finished: "읽은 책",
};
const STATUS_OPTIONS = Object.keys(STATUS_MAP) as BookStatus[];
const TAGS = [
  "인사이트",
  "동기부여",
  "위로/공감",
  "유머/재미",
  "표현력",
  "핵심요약",
  "충격/반전",
  "기타",
];

export default function BookDetailScreen() {
  const params = useLocalSearchParams();
  const bookId = Number(params.id);
  const coverUrl = params.cover_url as string;
  const [activeTab, setActiveTab] = useState<"sentence" | "memo" | "album">(
    "sentence",
  );
  const { newPhotoUri } = useLocalSearchParams();

  const {
    book,
    sentences,
    memos,
    loading,
    isSuccess,
    isDelete,
    successType,
    bookEditModalVisible,
    editTitle,
    editAuthor,
    setEditTitle,
    setEditAuthor,
    setBookEditModalVisible,
    sentenceEditModalVisible,
    editContent,
    editPage,
    editingTags,
    setEditContent,
    setEditPage,
    setSentenceEditModalVisible,
    memoEditModalVisible,
    memoContent,
    memoPage,
    setMemoContent,
    setMemoPage,
    setMemoEditModalVisible,
    isMemoAddModalVisible,
    newMemoContent,
    newMemoPage,
    setNewMemoContent,
    setNewMemoPage,
    setMemoAddModalVisible,
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
    handleSentenceOptions,
    updateSentence,
    handleMemoOptions,
    updateMemo,
    addMemo,
    handleUpdateStatus,
    handleSubmitReview,
    handleCancelReview,
    openReviewEditModal,
    handleUpdateReview,
    handleDeleteReview,
    handleEditingTagSelect,
  } = useBookDetailViewModel({
    bookId,
  });

  const {
    photos,
    pickAndUpload,
    isLoading,
    handlePhotoPress,
    uploadSharedPhoto,
  } = useAlbumViewModel({
    bookId: Number(bookId),
    bookTitle: book?.title || (params.title as string),
    bookAuthor: book?.author || (params.author as string),
  });

  useEffect(() => {
    if (newPhotoUri) {
      router.setParams({ newPhotoUri: "" });
      Alert.alert(
        "사진 저장",
        "선택하신 책에 공유된 사진을 저장하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "저장",
            onPress: async () => {
              await uploadSharedPhoto(newPhotoUri as string);
            },
          },
        ],
      );
    }
  }, [newPhotoUri, uploadSharedPhoto]);

  if (loading || !book) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#375A4E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#375A4E" />
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
            color="#375A4E"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bookInfoSection}>
        {coverUrl && (
          <Image source={{ uri: coverUrl }} style={styles.smallCover} />
        )}
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>{book.title}</Text>
          <Text style={styles.infoAuthor}>{book.author}</Text>
          <View style={styles.infoCountContainer}>
            <Text style={styles.infoCount}>문장 {sentences.length}</Text>
            <Text style={styles.infoCountDivider}>|</Text>
            <Text style={styles.infoCount}>메모 {memos.length}</Text>
            <Text style={styles.infoCountDivider}>|</Text>
            <Text style={styles.infoCount}>앨범 {photos.length}</Text>
          </View>
          {book.started_at && (
            <Text style={styles.infoDate}>
              {(() => {
                const start = new Date(book.started_at);
                const startStr = `${start.getFullYear()}.${String(
                  start.getMonth() + 1,
                ).padStart(2, "0")}.${String(start.getDate()).padStart(
                  2,
                  "0",
                )}`;

                const startDateOnly = new Date(
                  start.getFullYear(),
                  start.getMonth(),
                  start.getDate(),
                );

                if (book.finished_at) {
                  const end = new Date(book.finished_at);
                  const endStr = `${end.getFullYear()}.${String(
                    end.getMonth() + 1,
                  ).padStart(2, "0")}.${String(end.getDate()).padStart(
                    2,
                    "0",
                  )}`;

                  const endDateOnly = new Date(
                    end.getFullYear(),
                    end.getMonth(),
                    end.getDate(),
                  );
                  const diffTime = Math.abs(
                    endDateOnly.getTime() - startDateOnly.getTime(),
                  );
                  const diffDays =
                    Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

                  return `${startStr} ~ ${endStr} (총 ${diffDays}일)`;
                } else {
                  const now = new Date();
                  const endDateOnly = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                  );
                  const diffTime = Math.abs(
                    endDateOnly.getTime() - startDateOnly.getTime(),
                  );
                  const diffDays =
                    Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

                  return `${startStr} ~ 읽는 중 (${diffDays}일째)`;
                }
              })()}
            </Text>
          )}
        </View>
      </View>

      {book.rating ? (
        <TouchableOpacity
          style={styles.ratingContainer}
          onPress={openReviewEditModal}
        >
          <Text style={styles.ratingLabel}>나의 평점</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= book.rating! ? "star" : "star-outline"}
                size={24}
                color="#C49750"
              />
            ))}
          </View>
        </TouchableOpacity>
      ) : (
        book.status === "finished" && (
          <TouchableOpacity
            style={styles.ratingContainer}
            onPress={() => setReviewModalVisible(true)}
          >
            <Text style={styles.ratingLabel}>리뷰 작성하기</Text>
            <Ionicons
              name="create-outline"
              size={24}
              color="#557A68"
            />
          </TouchableOpacity>
        )
      )}

      {/* 상태 선택 UI */}
      <View style={styles.statusSelectorContainer}>
        {STATUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.statusButton,
              book.status === option && styles.activeStatusButton,
            ]}
            onPress={() => handleUpdateStatus(option)}
          >
            <Text
              style={[
                styles.statusButtonText,
                book.status === option && styles.activeStatusButtonText,
              ]}
            >
              {STATUS_MAP[option]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 버튼 (문장 / 메모 / 앨범) */}
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
            activeTab === "memo" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("memo")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "memo" && styles.activeTabText,
            ]}
          >
            메모
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

      <View style={styles.content}>
        {activeTab === "sentence" ? (
          <SentenceList
            sentences={sentences}
            onOptionPress={handleSentenceOptions}
          />
        ) : activeTab === "memo" ? (
          <View style={{ flex: 1 }}>
            <MemoList memos={memos} onOptionPress={handleMemoOptions} />
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setMemoAddModalVisible(true)}
            >
              <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <AlbumList
            photos={photos}
            onAddPress={pickAndUpload}
            isLoading={isLoading}
            onPhotoPress={handlePhotoPress}
          />
        )}
      </View>

      {/* 책 정보 수정 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={bookEditModalVisible}
        onRequestClose={() => setBookEditModalVisible(false)}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <View style={styles.tagContainerInModal}>
              <Text style={styles.label}>태그</Text>
              <View style={styles.tagList}>
                {TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tag,
                      editingTags.includes(tag) && styles.selectedTag,
                    ]}
                    onPress={() => handleEditingTagSelect(tag)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        editingTags.includes(tag) && styles.selectedTagText,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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

      {/* 메모 수정 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={memoEditModalVisible}
        onRequestClose={() => setMemoEditModalVisible(false)}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>메모 수정하기</Text>
            <Text style={styles.label}>메모 내용</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={memoContent}
              onChangeText={setMemoContent}
              multiline
              textAlignVertical="top"
              placeholder="메모를 입력하세요"
            />
            <Text style={styles.label}>페이지</Text>
            <TextInput
              style={styles.input}
              value={memoPage}
              onChangeText={setMemoPage}
              keyboardType="number-pad"
              placeholder="페이지 번호"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setMemoEditModalVisible(false)}
              >
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={updateMemo}
              >
                <Text style={styles.btnTextSave}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 메모 추가 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMemoAddModalVisible}
        onRequestClose={() => setMemoAddModalVisible(false)}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 메모 작성</Text>
            <Text style={styles.label}>메모 내용</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newMemoContent}
              onChangeText={setNewMemoContent}
              multiline
              textAlignVertical="top"
              placeholder="독서 중 떠오른 생각을 기록해보세요"
            />
            <Text style={styles.label}>페이지 (선택)</Text>
            <TextInput
              style={styles.input}
              value={newMemoPage}
              onChangeText={setNewMemoPage}
              keyboardType="number-pad"
              placeholder="페이지 번호"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setMemoAddModalVisible(false)}
              >
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={addMemo}
              >
                <Text style={styles.btnTextSave}>작성 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 리뷰 작성 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isReviewModalVisible}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>리뷰 작성</Text>
            <Text style={styles.label}>별점</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                  <Ionicons
                    name={star <= newRating ? "star" : "star-outline"}
                    size={32}
                    color="#C49750"
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>리뷰</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newReview}
              onChangeText={setNewReview}
              multiline
              textAlignVertical="top"
              placeholder="리뷰를 남겨주세요 (선택)"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={handleCancelReview}
              >
                <Text style={styles.btnTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleSubmitReview}
              >
                <Text style={styles.btnTextSave}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 리뷰 수정/조회 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isReviewEditModalVisible}
        onRequestClose={() => setReviewEditModalVisible(false)}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>리뷰 수정</Text>
            <Text style={styles.label}>별점</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setEditingRating(star)}
                >
                  <Ionicons
                    name={star <= editingRating ? "star" : "star-outline"}
                    size={32}
                    color="#C49750"
                    style={{ marginHorizontal: 5 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>리뷰</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editingReview}
              onChangeText={setEditingReview}
              multiline
              textAlignVertical="top"
              placeholder="리뷰를 남겨주세요 (선택)"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnDelete]}
                onPress={handleDeleteReview}
              >
                <Text style={styles.btnTextDelete}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleUpdateReview}
              >
                <Text style={styles.btnTextSave}>수정</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {successType === "review" ? (
        <CongratsModal visible={isSuccess} onFinish={handleAnimationFinish} />
      ) : (
        <SuccessModal
          visible={isSuccess}
          onFinish={handleAnimationFinish}
          message="수정 완료!"
        />
      )}
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
  container: { flex: 1, backgroundColor: "#F7F5F0" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.base * 1.5,
    paddingHorizontal: SIZES.padding,
  },
  backButton: { padding: SIZES.base / 2 },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: "#24332D",
  },
  settingsButton: {
    padding: 5,
  },
  bookInfoSection: {
    flexDirection: "row",
    padding: SIZES.padding * 0.75,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius * 1.5,
    borderWidth: 1,
    borderColor: "#E6E4DC",
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  smallCover: {
    width: 60,
    height: 90,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base * 2,
    backgroundColor: "#E8E7E0",
  },
  infoText: { justifyContent: "center", flex: 1 },
  infoTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.base / 2,
    color: "#24332D",
  },
  infoAuthor: {
    fontSize: SIZES.body4,
    color: "#78857E",
    marginBottom: SIZES.base / 2,
  },
  infoCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoCount: {
    fontSize: SIZES.body4,
    color: "#557A68",
    fontWeight: "600",
  },
  infoCountDivider: {
    fontSize: SIZES.body4,
    color: "#A0AAA3",
    marginHorizontal: SIZES.base,
  },
  infoDate: {
    fontSize: 12,
    color: "#87958C",
    marginTop: SIZES.base / 2,
  },
  statusSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SIZES.base * 0.75,
    paddingHorizontal: SIZES.padding,
  },
  statusButton: {
    paddingVertical: SIZES.base * 0.8,
    paddingHorizontal: SIZES.base * 1.5,
    borderRadius: SIZES.radius * 2,
    backgroundColor: "#EEF2ED",
  },
  activeStatusButton: {
    backgroundColor: "#375A4E",
  },
  statusButtonText: {
    fontSize: SIZES.body4,
    color: "#66766D",
    fontWeight: "700",
  },
  activeStatusButtonText: {
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(36, 51, 45, 0.38)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFFEFA",
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    padding: SIZES.padding,
    shadowColor: "#3A493F",
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
    color: "#24332D",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: SIZES.body4,
    fontWeight: "600",
    color: "#66766D",
    marginBottom: SIZES.base * 0.75,
    marginTop: SIZES.base,
  },
  input: {
    width: "100%",
    backgroundColor: "#F3F6F1",
    borderWidth: 1,
    borderColor: "#DCE5DB",
    borderRadius: SIZES.radius,
    padding: SIZES.base * 1.5,
    fontSize: SIZES.body3,
    color: "#24332D",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SIZES.padding,
    width: "100%",
  },
  btn: {
    flex: 1,
    padding: SIZES.base * 1.8,
    borderRadius: SIZES.radius,
    alignItems: "center",
  },
  btnCancel: { backgroundColor: "#EEF2ED", marginRight: SIZES.base },
  btnSave: { backgroundColor: "#375A4E" },
  btnTextCancel: { color: "#66766D", fontWeight: "bold" },
  btnTextSave: { color: "#FFFFFF", fontWeight: "bold" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EEF2ED",
    borderRadius: SIZES.radius,
    padding: 4,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    alignItems: "center",
    borderRadius: SIZES.radius - 2,
  },
  activeTabButton: {
    backgroundColor: "#FFFDFC",
  },
  tabText: {
    fontSize: SIZES.body3,
    color: "#78857E",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#375A4E",
    fontWeight: "bold",
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: SIZES.base,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 1.5,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
    backgroundColor: "#FFF8EC",
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: "#F0E2C9",
  },
  ratingLabel: {
    fontSize: SIZES.body3,
    fontWeight: "bold",
    color: "#63513A",
  },
  btnDelete: {
    backgroundColor: "#ff4d4f",
    marginRight: SIZES.base,
  },
  btnTextDelete: {
    color: "white",
    fontWeight: "bold",
  },
  tagContainerInModal: {
    marginTop: SIZES.base,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.base,
    marginTop: SIZES.base,
  },
  tag: {
    backgroundColor: "#EEF2ED",
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 1.5,
  },
  selectedTag: {
    backgroundColor: "#375A4E",
  },
  tagText: {
    fontSize: SIZES.body4,
    color: "#66766D",
  },
  selectedTagText: {
    color: "white",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#375A4E",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
