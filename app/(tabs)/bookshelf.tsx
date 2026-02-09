import { SIZES, Colors } from "@/constants/theme";
import { Book, BookStatus } from "@/types/book";
import { useBookshelfViewModel } from "@/view-models/useBookshelfViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const GAP = SIZES.base * 2;
const PADDING = SIZES.padding;
const BOOK_WIDTH = (SIZES.width - PADDING * 2 - GAP) / 2;

const STATUS_MAP: Record<BookStatus | "all", string> = {
  all: "전체",
  wish: "읽을 책",
  reading: "읽는 중",
  finished: "읽은 책",
};
const STATUS_OPTIONS = Object.keys(STATUS_MAP) as (BookStatus | "all")[];

export default function BookshelfScreen() {
  const router = useRouter();
  const {
    books,
    isLoading,
    filteredBooks,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    handleStatusChange,
  } = useBookshelfViewModel();

  const handleAddBook = () => {
    Alert.alert(
      "새 책 추가",
      "어떤 방법으로 추가하시겠어요?",
      [
        { text: "바코드 검색", onPress: () => router.push("/scan-barcode") },
        { text: "직접 추가", onPress: () => router.push("/add-book") },
        { text: "취소", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  const bookCounts = useMemo(() => {
    return books.reduce(
      (acc, book) => {
        acc.all += 1;
        acc[book.status] += 1;
        return acc;
      },
      { all: 0, wish: 0, reading: 0, finished: 0 },
    );
  }, [books]);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "검색 결과가 없습니다."
          : "해당하는 책이 책장에 없어요."}
      </Text>
      {!searchQuery && (
        <Text style={styles.emptySubText}>
          우측 하단 버튼을 눌러 새 책을 추가해보세요.
        </Text>
      )}
    </View>
  );

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() =>
        router.push({
          pathname: "/book-detail/[id]",
          params: {
            id: item.id,
            title: item.title,
            author: item.author,
            cover_url: item.cover_url,
          },
        })
      }
    >
      {item.cover_url ? (
        <Image
          source={{ uri: item.cover_url }}
          style={styles.bookCover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.bookCoverPlaceholder}>
          <Text style={{ fontSize: SIZES.h2, color: "#aaa" }}>
            {item.title?.substring(0, 1)}
          </Text>
        </View>
      )}
      <Text style={styles.bookTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {item.author}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>책장</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.light.icon}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="책 제목, 저자 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.light.icon}
        />
      </View>

      <View style={styles.statusFilterContainer}>
        {STATUS_OPTIONS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              selectedStatus === status && styles.activeStatusButton,
            ]}
            onPress={() => handleStatusChange(status)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === status && styles.activeStatusButtonText,
              ]}
            >
              {`${STATUS_MAP[status]} ${bookCounts[status]}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContentContainer}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddBook}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: SIZES.radius,
    marginHorizontal: PADDING,
    paddingHorizontal: SIZES.base * 1.5,
    marginBottom: SIZES.base,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: SIZES.body3,
    color: Colors.light.text,
  },
  statusFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: SIZES.base,
    paddingHorizontal: PADDING,
    backgroundColor: Colors.light.background,
    marginBottom: SIZES.base,
  },
  statusButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 1.5,
    borderRadius: SIZES.radius * 2,
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
  listContentContainer: {
    paddingHorizontal: PADDING,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
    marginTop: SIZES.height / 5,
  },
  emptyText: {
    fontSize: SIZES.h3,
    color: "#555",
    marginBottom: SIZES.base,
  },
  emptySubText: {
    fontSize: SIZES.body4,
    color: "#888",
    marginBottom: SIZES.padding,
  },
  row: {
    justifyContent: "flex-start",
    gap: GAP,
    marginBottom: SIZES.padding,
  },
  bookItem: {
    marginTop: SIZES.padding,
    width: BOOK_WIDTH,
    alignItems: "center",
  },
  bookCoverPlaceholder: {
    width: BOOK_WIDTH,
    height: BOOK_WIDTH * 1.5,
    backgroundColor: "#e0e0e0",
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    justifyContent: "center",
    alignItems: "center",
  },
  bookTitle: {
    fontSize: SIZES.body4,
    textAlign: "center",
    color: Colors.light.text,
  },
  bookCover: {
    width: BOOK_WIDTH,
    height: BOOK_WIDTH * 1.5,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    backgroundColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: SIZES.padding,
    right: SIZES.padding,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});