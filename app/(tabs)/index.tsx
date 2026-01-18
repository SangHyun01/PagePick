import { supabase } from "@/lib/supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// 기본 명언 (저장된 문장이 없을 때 보여줄 것)
const DEFAULT_QUOTE = {
  content: "책은 얼어붙은 감수성을 깨는 도끼여야 한다.",
  source: "프란츠 카프카",
  page: null,
};

export default function HomeScreen() {
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null); // 현재 보여줄 문장
  const [loading, setLoading] = useState(true);

  // 홈으로 돌아올 때마다 실행
  useFocusEffect(
    useCallback(() => {
      fetchRandomSentence();
    }, []),
  );

  const fetchRandomSentence = async () => {
    try {
      // 내 문장 가져오기
      const { data, error } = await supabase.from("sentences").select(`
          content,
          page,
          books (
            title,
            author
          )
        `);

      if (error) throw error;

      // 문장이 있으면 랜덤으로 하나 뽑기
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomItem = data[randomIndex] as any;

        setQuote({
          content: randomItem.content,
          source: Array.isArray(randomItem.books)
            ? randomItem.books[0]?.title
            : randomItem.books?.title || "알 수 없는 책",
          author: Array.isArray(randomItem.books)
            ? randomItem.books[0]?.author
            : randomItem.books?.author,
          page: randomItem.page,
        });
      } else {
        // 문장이 없으면 기본 명언 사용
        setQuote(DEFAULT_QUOTE);
      }
    } catch (e) {
      console.error(e);
      setQuote(DEFAULT_QUOTE); // 에러나면 기본 명언
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>PagePick</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString()}의 영감
        </Text>
      </View>

      {/* 수집한 문장 중 랜덤 */}
      <View style={styles.quoteCard}>
        <FontAwesome
          name="quote-left"
          size={32}
          color="#007AFF"
          style={styles.quoteIcon}
        />

        {loading ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <>
            <Text style={styles.quoteText}>{quote?.content}</Text>

            <View style={styles.sourceContainer}>
              <Text style={styles.quoteAuthor}>
                - {quote?.source} {quote?.author ? `(${quote.author})` : ""}
              </Text>
              {quote?.page && (
                <Text style={styles.pageText}>p.{quote.page}</Text>
              )}
            </View>

            <View style={styles.decoLine} />

            {quote === DEFAULT_QUOTE ? (
              <Text style={styles.cardFooter}>첫 문장을 수집해보세요!</Text>
            ) : (
              <Text style={styles.cardFooter}>
                내가 수집한 문장 중 하나입니다
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push("/camera")}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="camera" size={32} color="#007AFF" />
          </View>
          <View style={styles.btnTextContainer}>
            <Text style={styles.mainButtonTitle}>문장 수집하기</Text>
            <Text style={styles.mainButtonDesc}>카메라로 책을 스캔하세요</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: { marginBottom: 30 },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#333",
    letterSpacing: -0.5,
  },
  dateText: { fontSize: 14, color: "#888", marginTop: 5 },

  // 인용구 카드
  quoteCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 30,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    alignItems: "center",
    minHeight: 250,
    justifyContent: "center",
  },
  quoteIcon: { marginBottom: 15, opacity: 0.3 },
  quoteText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: 28,
    fontStyle: "italic",
    marginBottom: 15,
  },
  sourceContainer: { alignItems: "center", marginBottom: 20 },
  quoteAuthor: { fontSize: 14, color: "#555", fontWeight: "600" },
  pageText: { fontSize: 12, color: "#999", marginTop: 2 },

  decoLine: {
    width: 40,
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    marginBottom: 20,
  },
  cardFooter: { fontSize: 13, color: "#AAA" },

  actionContainer: { flex: 1, justifyContent: "flex-start" },
  mainButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  btnTextContainer: { flex: 1 },
  mainButtonTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  mainButtonDesc: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
});
