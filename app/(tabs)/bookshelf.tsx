import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Book {
  id: string;
  title: string;
  cover_url: string;
  author?: string;
}

export default function BookshelfScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]); // 초기에는 책이 없는 상태
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
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
      { cancelable: true }
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>책장이 비어있어요.</Text>
      <Text style={styles.emptySubText}>
        아래 버튼을 눌러 첫 책을 추가해보세요.
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
        <Ionicons name="add" size={60} color="#007AFF" />
      </TouchableOpacity>
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
          {/* 표지가 없을 때 제목 첫 글자라도 보여주면 덜 심심합니다 */}
          <Text style={{ fontSize: 20, color: "#aaa" }}>
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

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  listContentContainer: {
    flexGrow: 1,
    padding: 10,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 40,
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
  // Book Item Styles
  bookItem: {
    flex: 1,
    margin: 10,
    alignItems: "center",
    maxWidth: "50%",
  },
  bookCoverPlaceholder: {
    width: 150,
    height: 220,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    textAlign: "center",
  },
  bookCover: {
    width: 150,
    height: 220,
    borderRadius: 8,
    marginBottom: 8,
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
});
