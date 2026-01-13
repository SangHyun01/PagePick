import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Sentence {
  id: number;
  content: string;
  page: number;
  create_at: string;
}

export default function BookDetailScreen() {
  // 책장에서 넘겨준 책 정보
  const params = useLocalSearchParams();
  const bookId = params.id;
  const bookTitle = params.title as string;
  const bookAuthor = params.author as string;
  const coverUrl = params.cover_url as string;

  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (bookId) {
        fetchSentences();
      }
    }, [bookId])
  );

  const fetchSentences = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("sentences")
        .select("*")
        .eq("book_id", bookId)
        .order("page", { ascending: true });

      if (error) throw error;

      if (data) {
        setSentences(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderSentenceItem = ({ item }: { item: Sentence }) => (
    <View style={styles.card}>
      <View style={styles.quoteIcon}></View>
      <Text style={styles.sentenceText}>{item.content}</Text>
      <View style={styles.pageContainer}>
        <Text style={styles.pageText}>p.{item.page}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            아카이브
          </Text>
        </View>
        <View style={{ width: 28, paddingHorizontal: 10 }} />
      </View>

      {/* 책 정보 간략 표시 */}
      <View style={styles.bookInfoSection}>
        {coverUrl && (
          <Image source={{ uri: coverUrl }} style={styles.smallCover} />
        )}
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>{bookTitle}</Text>
          <Text style={styles.infoAuthor}>{bookAuthor}</Text>
          <Text style={styles.infoCount}>수집한 문장 {sentences.length}개</Text>
        </View>
      </View>

      {/* 문장 리스트 */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={sentences}
          renderItem={renderSentenceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>아직 저장된 문장이 없습니다.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: { padding: 4 },

  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },

  // 제목 텍스트
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  bookInfoSection: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  smallCover: {
    width: 50,
    height: 75,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: "#eee",
  },
  infoText: { justifyContent: "center", flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  infoAuthor: { fontSize: 14, color: "#666", marginBottom: 4 },
  infoCount: { fontSize: 12, color: "#007AFF", fontWeight: "600" },

  listContent: { padding: 16 },

  // 문장 카드 스타일
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  quoteIcon: { marginBottom: 8 },
  sentenceText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  pageContainer: {
    alignItems: "flex-end",
    marginTop: 12,
  },
  pageText: {
    fontSize: 12,
    color: "#888",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#999", fontSize: 16 },
});
