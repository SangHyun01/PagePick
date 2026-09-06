import { SIZES } from "@/constants/theme";
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
      <View style={styles.emptyIconCircle}>
        <Ionicons name="library-outline" size={SIZES.h1} color="#557A68" />
      </View>
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
      <View style={styles.coverContainer}>
        {item.cover_url ? (
          <Image
            source={{ uri: item.cover_url }}
            style={styles.bookCover}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.bookCoverPlaceholder}>
            <Text style={styles.placeholderInitial}>
              {item.title?.substring(0, 1)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.bookStatusBadge,
            item.status === "reading" && styles.readingBookStatusBadge,
            item.status === "finished" && styles.finishedBookStatusBadge,
          ]}
        >
          <Text style={styles.bookStatusText}>{STATUS_MAP[item.status]}</Text>
        </View>
      </View>
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
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>나의 책장</Text>
          <View style={styles.bookCountBadge}>
            <Text style={styles.bookCountText}>{books.length}권</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#78857E"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="책 제목, 저자 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9AA69E"
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
          <ActivityIndicator size="large" color="#375A4E" />
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
    backgroundColor: "#F7F5F0",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.padding * 0.85,
    paddingHorizontal: SIZES.padding,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: SIZES.h1 + 2,
    fontWeight: "700",
    color: "#24332D",
  },
  bookCountBadge: {
    backgroundColor: "#E8EFEA",
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base * 1.25,
  },
  bookCountText: {
    color: "#557A68",
    fontSize: SIZES.body4 - 2,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDFC",
    borderWidth: 1,
    borderColor: "#E4E1D8",
    borderRadius: SIZES.radius * 1.25,
    marginHorizontal: PADDING,
    paddingHorizontal: SIZES.base * 1.5,
    marginBottom: SIZES.base * 1.5,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: SIZES.body3,
    color: "#24332D",
  },
  statusFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: PADDING,
    marginBottom: SIZES.base * 1.5,
  },
  statusButton: {
    paddingVertical: SIZES.base * 0.85,
    paddingHorizontal: SIZES.base,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeStatusButton: {
    backgroundColor: "#E8EFEA",
    borderColor: "#D9E5DA",
  },
  statusButtonText: {
    fontSize: SIZES.body4 - 2,
    color: "#78857E",
    fontWeight: "600",
  },
  activeStatusButtonText: {
    color: "#375A4E",
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
    marginTop: SIZES.height / 6,
  },
  emptyIconCircle: {
    width: SIZES.padding * 2.4,
    height: SIZES.padding * 2.4,
    borderRadius: SIZES.padding * 1.2,
    backgroundColor: "#E8EFEA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.h3,
    color: "#405148",
    fontWeight: "700",
    marginBottom: SIZES.base,
  },
  emptySubText: {
    fontSize: SIZES.body4,
    color: "#87958C",
    marginBottom: SIZES.padding,
  },
  row: {
    justifyContent: "flex-start",
    gap: GAP,
    marginBottom: SIZES.padding,
  },
  bookItem: {
    marginTop: SIZES.base,
    width: BOOK_WIDTH,
    alignItems: "flex-start",
  },
  coverContainer: {
    width: BOOK_WIDTH,
    height: BOOK_WIDTH * 1.5,
    marginBottom: SIZES.base,
    borderRadius: SIZES.radius * 1.25,
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookCoverPlaceholder: {
    width: BOOK_WIDTH,
    height: BOOK_WIDTH * 1.5,
    backgroundColor: "#E8EFEA",
    borderRadius: SIZES.radius * 1.25,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderInitial: { fontSize: SIZES.h2 + 4, color: "#557A68", fontWeight: "700" },
  bookTitle: {
    fontSize: SIZES.body4,
    textAlign: "left",
    color: "#24332D",
    fontWeight: "700",
  },
  bookCover: {
    width: BOOK_WIDTH,
    height: BOOK_WIDTH * 1.5,
    borderRadius: SIZES.radius * 1.25,
    backgroundColor: "#E9E7E1",
  },
  bookAuthor: {
    fontSize: 12,
    color: "#87958C",
    textAlign: "left",
    marginTop: 2,
  },
  bookStatusBadge: {
    position: "absolute",
    top: SIZES.base,
    left: SIZES.base,
    backgroundColor: "rgba(255, 253, 252, 0.94)",
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
  },
  readingBookStatusBadge: { backgroundColor: "#DCEBDD" },
  finishedBookStatusBadge: { backgroundColor: "#F1E8D9" },
  bookStatusText: {
    color: "#405148",
    fontSize: SIZES.body4 - 4,
    fontWeight: "700",
  },
  floatingButton: {
    position: "absolute",
    bottom: SIZES.padding,
    right: SIZES.padding,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#375A4E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
