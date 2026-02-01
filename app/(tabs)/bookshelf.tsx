import { SIZES } from "@/src/constants/theme";
import { supabase } from "@/src/lib/supabase";
import { Book } from "@/src/types/book";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GAP = SIZES.base * 2;
const PADDING = SIZES.padding;

const BOOK_WIDTH = (SIZES.width - PADDING * 2 - GAP) / 2;

export default function BookshelfScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]); // 초기에는 책이 없는 상태
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, []),
  );

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setBooks(data);
      }
    } catch (e) {
      console.error("불러오기 실패", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = () => {
    Alert.alert(
      "새 책 추가",
      "어떤 방법으로 추가하시겠어요?",
      [
        {
          text: "바코드 검색",
          onPress: () => {
            router.push("/scan-barcode");
          },
        },
        {
          text: "직접 추가",
          onPress: () => {
            router.push("/add-book");
          },
        },
        {
          text: "취소",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>책장이 비어있어요.</Text>
      <Text style={styles.emptySubText}>
        우측 하단 버튼을 눌러 첫 책을 추가해보세요.
      </Text>
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContentContainer}
          columnWrapperStyle={styles.row} // 좌우 정렬 보정
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
    backgroundColor: "#fff",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: "bold",
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
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
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
  },
  bookCover: {
    width: BOOK_WIDTH,
    height: BOOK_WIDTH * 1.5,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    backgroundColor: "#eee", // 로딩 전 배경색
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
    position: "absolute", // 공중에 띄우기
    bottom: SIZES.padding, // 하단에서 30만큼 위로
    right: SIZES.padding, // 우측에서 20만큼 왼쪽으로
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
