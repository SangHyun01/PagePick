import AlbumList from "@/components/AlbumList";
import CongratsModal from "@/components/CongratsModal";
import SentenceList from "@/components/SentenceList";
import SuccessModal from "@/components/SuccessModal";
import { Colors, SIZES } from "@/constants/theme";
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
  const [activeTab, setActiveTab] = useState<"sentence" | "album">("sentence");
  const { newPhotoUri } = useLocalSearchParams();

  const {
    book,
    sentences,
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
        <ActivityIndicator size="large" color={Colors.light.tint} />
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
          <Text style={styles.infoTitle}>{book.title}</Text>
          <Text style={styles.infoAuthor}>{book.author}</Text>
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
                color={Colors.light.tint}
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
              color={Colors.light.tint}
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
                    color={Colors.light.tint}
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
                    color={Colors.light.tint}
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
  },
  smallCover: {
    width: 60,
    height: 90,
    borderRadius: SIZES.radius / 2,
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
  statusSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 2,
    borderRadius: SIZES.radius * 2,
    backgroundColor: "#f0f0f0",
  },
  activeStatusButton: {
    backgroundColor: Colors.light.tint,
  },
  statusButtonText: {
    fontSize: SIZES.body4,
    color: Colors.light.text,
    fontWeight: "bold",
  },
  activeStatusButtonText: {
    color: "white",
  },
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
    alignSelf: "flex-start",
    fontSize: SIZES.body4,
    fontWeight: "600",
    color: Colors.light.icon,
    marginBottom: SIZES.base * 0.75,
    marginTop: SIZES.base,
  },
  input: {
    width: "100%",
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
    width: "100%",
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
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ratingLabel: {
    fontSize: SIZES.body3,
    fontWeight: "bold",
    color: Colors.light.text,
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
    backgroundColor: "#f0f0f0",
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 1.5,
  },
  selectedTag: {
    backgroundColor: Colors.light.tint,
  },
  tagText: {
    fontSize: SIZES.body4,
    color: Colors.light.text,
  },
  selectedTagText: {
    color: "white",
    fontWeight: "bold",
  },
});
