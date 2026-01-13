import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

interface Book {
  id: number;
  title: string;
  cover_url: string;
  author: string;
}

export default function SelectBookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const content = Array.isArray(params.content)
    ? params.content[0]
    : params.content;
  const page = Array.isArray(params.page) ? params.page[0] : params.page;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // 화면이 켜질때마다 책 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setBooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = async (bookId: number, bookTitle: string) => {
    if (!content) {
      Alert.alert("오류", "저장할 문장이 없습니다.");
      return;
    }
    try {
      const { error } = await supabase.from("sentences").insert([
        {
          content: content,
          page: page ? parseInt(page) : null,
          book_id: bookId,
        },
      ]);

      if (error) throw error;

      Alert.alert("저장 완료!", `"${bookTitle}에 문장을 기록했습니다.`, [
        {
          text: "확인",
          onPress: () => {
            router.dismissAll();
            router.replace("/(tabs)/bookshelf");
          },
        },
      ]);
    } catch (e: any) {
      console.error(e);
      Alert.alert("저장 실패", e.message);
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => handleSelectBook(item.id, item.title)}
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
      <Ionicons name="checkmark-circle-outline" size={24} color="#007AFF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>어떤 책인가요?</Text>

        <TouchableOpacity onPress={() => router.push("/scan-barcode")}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  backText: { fontSize: 16, color: "#666" },
  addText: { fontSize: 16, color: "#007AFF", fontWeight: "bold" },

  contentPreview: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  previewLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  previewText: { fontSize: 14, color: "#333", fontStyle: "italic" },

  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bookCover: {
    width: 50,
    height: 75,
    borderRadius: 4,
    backgroundColor: "#eee",
  },
  bookPlaceholder: {
    width: 50,
    height: 75,
    borderRadius: 4,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  bookInfo: { flex: 1, marginLeft: 15 },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bookAuthor: { fontSize: 14, color: "#888" },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#333", marginBottom: 5 },
  emptySubText: { fontSize: 14, color: "#888" },
});
