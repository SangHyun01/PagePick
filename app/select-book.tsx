import SuccessModal from "@/components/SuccessModal";
import { SIZES } from "@/constants/theme";
import { Book } from "@/types/book";
import { useSelectBookViewModel } from "@/view-models/useSelectBookViewModel";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SelectBookScreen() {
  const {
    content,
    books,
    loading,
    showSuccess,
    isAddBookModalVisible,
    setIsAddBookModalVisible,
    handleAddNewBook,
    handleScanBarcode,
    handleManualBookEntry,
    handleAnimationFinish,
    handleSelectBook,
    handleCancel,
  } = useSelectBookViewModel();

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => handleSelectBook(item.id)}
    >
      {item.cover_url ? (
        <Image source={{ uri: item.cover_url }} style={styles.bookCover} />
      ) : (
        <View style={styles.bookPlaceholder}>
          <Text style={styles.placeholderText}>
            {item.title.substring(0, 1)}
          </Text>
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.backText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>어떤 책인가요?</Text>
        <TouchableOpacity onPress={handleAddNewBook}>
          <Text style={styles.addText}>+ 새 책</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentPreview}>
        <Text style={styles.previewLabel}>저장할 문장:</Text>
        <Text numberOfLines={2} style={styles.previewText}>
          {content}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>등록된 책이 없습니다.</Text>
              <Text style={styles.emptySubText}>
                오른쪽 위 버튼을 눌러 책을 먼저 추가해주세요.
              </Text>
            </View>
          }
        />
      )}

      <SuccessModal
        visible={showSuccess}
        onFinish={handleAnimationFinish}
        message="등록 완료!"
      />

      <Modal
        visible={isAddBookModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddBookModalVisible(false)}
      >
        <View style={styles.addBookModalOverlay}>
          <View style={styles.addBookModalCard}>
            <TouchableOpacity
              style={styles.addBookModalClose}
              onPress={() => setIsAddBookModalVisible(false)}
              accessibilityLabel="새 책 추가 모달 닫기"
            >
              <Ionicons name="close" size={22} color="#64736A" />
            </TouchableOpacity>
            <Text style={styles.addBookModalTitle}>새 책을 추가해볼까요?</Text>
            <Text style={styles.addBookModalDescription}>
              책을 찾는 방법을 선택해주세요.
            </Text>
            <TouchableOpacity style={styles.addBookOption} onPress={handleScanBarcode} activeOpacity={0.8}>
              <View style={styles.addBookOptionIcon}>
                <Ionicons name="barcode-outline" size={22} color="#557A68" />
              </View>
              <View style={styles.addBookOptionTextWrap}>
                <Text style={styles.addBookOptionTitle}>바코드로 찾기</Text>
                <Text style={styles.addBookOptionDescription}>책 뒤표지의 바코드를 스캔해요</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A2AEA5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBookOption} onPress={handleManualBookEntry} activeOpacity={0.8}>
              <View style={styles.addBookOptionIcon}>
                <Ionicons name="create-outline" size={21} color="#557A68" />
              </View>
              <View style={styles.addBookOptionTextWrap}>
                <Text style={styles.addBookOptionTitle}>직접 입력하기</Text>
                <Text style={styles.addBookOptionDescription}>책 정보를 직접 기록해요</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A2AEA5" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5F0",
    paddingTop: SIZES.padding * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.base * 1.5,
  },
  headerTitle: { fontSize: SIZES.h3, fontWeight: "700", color: "#24332D" },
  backText: { fontSize: SIZES.body3, color: "#557A68", fontWeight: "600" },
  addText: { fontSize: SIZES.body3, color: "#375A4E", fontWeight: "700" },

  contentPreview: {
    backgroundColor: "#FFFDFC",
    padding: SIZES.padding * 0.9,
    margin: SIZES.padding,
    borderRadius: SIZES.radius * 1.25,
    borderWidth: 1,
    borderColor: "#E1E7DF",
  },
  previewLabel: {
    fontSize: SIZES.h4,
    color: "#647A6B",
    marginBottom: SIZES.base / 2,
  },
  previewText: { fontSize: SIZES.body4, color: "#405148", fontStyle: "italic", lineHeight: SIZES.body4 * 1.45 },

  listContent: { paddingHorizontal: SIZES.padding, paddingBottom: SIZES.padding * 2 },

  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.base * 1.25,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: SIZES.radius * 1.15,
    backgroundColor: "#FFFDFC",
  },
  bookCover: {
    width: SIZES.largeTitle,
    height: SIZES.largeTitle * 1.5,
    borderRadius: SIZES.radius,
    backgroundColor: "#E9E7E1",
  },
  bookPlaceholder: {
    width: SIZES.largeTitle,
    height: SIZES.largeTitle * 1.5,
    borderRadius: SIZES.radius,
    backgroundColor: "#E8EFEA",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: SIZES.h2, fontWeight: "700", color: "#557A68" },
  bookInfo: { flex: 1, marginLeft: SIZES.base * 2 },
  bookTitle: {
    fontSize: SIZES.body3,
    fontWeight: "700",
    color: "#24332D",
    marginBottom: SIZES.base / 2,
  },
  bookAuthor: { fontSize: SIZES.body4, color: "#87958C" },

  emptyContainer: { alignItems: "center", marginTop: SIZES.largeTitle },
  emptyText: {
    fontSize: SIZES.body3,
    color: "#405148",
    marginBottom: SIZES.base / 2,
  },
  emptySubText: { fontSize: SIZES.body4, color: "#87958C" },

  addBookModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.padding,
    backgroundColor: "rgba(36, 51, 45, 0.46)",
  },
  addBookModalCard: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    padding: SIZES.padding * 1.25,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    backgroundColor: "#FFFEFA",
    shadowColor: "#24332D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  addBookModalClose: { position: "absolute", top: SIZES.base, right: SIZES.base, padding: SIZES.base },
  addBookModalTitle: { color: "#24332D", fontSize: SIZES.h3, fontWeight: "700", marginTop: SIZES.padding },
  addBookModalDescription: { color: "#78857E", fontSize: SIZES.body4 - 1, marginTop: SIZES.base, marginBottom: SIZES.padding },
  addBookOption: { width: "100%", flexDirection: "row", alignItems: "center", padding: SIZES.padding * 0.85, marginTop: SIZES.base, borderWidth: 1, borderColor: "#E1E7DF", borderRadius: SIZES.radius * 1.15, backgroundColor: "#F2F6F1" },
  addBookOptionIcon: { width: SIZES.padding * 2.2, height: SIZES.padding * 2.2, alignItems: "center", justifyContent: "center", borderRadius: SIZES.padding * 1.1, backgroundColor: "#FFFFFF" },
  addBookOptionTextWrap: { flex: 1, marginLeft: SIZES.base * 1.5 },
  addBookOptionTitle: { color: "#31443A", fontSize: SIZES.body3, fontWeight: "700" },
  addBookOptionDescription: { color: "#7B897F", fontSize: SIZES.body4 - 2, marginTop: 3 },

});
