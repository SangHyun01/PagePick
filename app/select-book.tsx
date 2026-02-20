import SuccessModal from "@/components/SuccessModal";
import { SIZES } from "@/constants/theme";
import { Book } from "@/types/book";
import { useSelectBookViewModel } from "@/view-models/useSelectBookViewModel";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SelectBookScreen() {
  const {
    router,
    content,
    books,
    loading,
    showSuccess,
    handleAddNewBook,
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
          contentContainerStyle={{ padding: 20 }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: SIZES.padding * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.base * 2,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: SIZES.h3, fontWeight: "bold" },
  backText: { fontSize: SIZES.body3, color: "#666" },
  addText: { fontSize: SIZES.body3, color: "#007AFF", fontWeight: "bold" },

  contentPreview: {
    backgroundColor: "#f9f9f9",
    padding: SIZES.base * 2,
    margin: SIZES.padding,
    borderRadius: SIZES.radius * 0.8,
  },
  previewLabel: {
    fontSize: SIZES.h4,
    color: "#888",
    marginBottom: SIZES.base / 2,
  },
  previewText: { fontSize: SIZES.body4, color: "#333", fontStyle: "italic" },

  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.base * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bookCover: {
    width: SIZES.largeTitle,
    height: SIZES.largeTitle * 1.5,
    borderRadius: SIZES.base / 2,
    backgroundColor: "#eee",
  },
  bookPlaceholder: {
    width: SIZES.largeTitle,
    height: SIZES.largeTitle * 1.5,
    borderRadius: SIZES.base / 2,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: SIZES.h2, fontWeight: "bold", color: "#fff" },
  bookInfo: { flex: 1, marginLeft: SIZES.base * 2 },
  bookTitle: {
    fontSize: SIZES.body3,
    fontWeight: "bold",
    color: "#333",
    marginBottom: SIZES.base / 2,
  },
  bookAuthor: { fontSize: SIZES.body4, color: "#888" },

  emptyContainer: { alignItems: "center", marginTop: SIZES.largeTitle },
  emptyText: {
    fontSize: SIZES.body3,
    color: "#333",
    marginBottom: SIZES.base / 2,
  },
  emptySubText: { fontSize: SIZES.body4, color: "#888" },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  lottieContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  successText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
