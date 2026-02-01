import { SIZES } from "@/src/constants/theme";
import { supabase } from "@/src/lib/supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      {/* 상단 로고 및 날짜 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>PagePick</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString()}의 영감
        </Text>
      </View>

      {/* 스크롤이 필요한 메인 컨텐츠 영역 */}
      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentScrollViewContainer}
      >
        {/* 수집한 문장 중 랜덤 */}
        <View style={styles.quoteCard}>
          <FontAwesome
            name="quote-left"
            size={SIZES.h1}
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
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => router.push("/camera")}
          activeOpacity={0.8}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="camera" size={SIZES.h1} color="#007AFF" />
          </View>
          <View style={styles.btnTextContainer}>
            <Text style={styles.mainButtonTitle}>문장 수집하기</Text>
            <Text style={styles.mainButtonDesc}>카메라로 책을 스캔하세요</Text>
          </View>
          <Ionicons name="chevron-forward" size={SIZES.h2} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    paddingTop: SIZES.padding * 2.5,
  },
  header: {
    marginBottom: SIZES.padding * 1.5,
    paddingHorizontal: SIZES.padding,
  },
  logoText: {
    fontSize: SIZES.h1,
    fontWeight: "900",
    color: "#333",
    letterSpacing: -0.5,
  },
  dateText: { fontSize: SIZES.body4, color: "#888", marginTop: SIZES.base / 2 },

  // 스크롤 뷰
  contentScrollView: {
    flex: 1,
  },
  contentScrollViewContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding, // 버튼 영역과 겹치지 않도록 하단 여백
  },

  // 인용구 카드
  quoteCard: {
    backgroundColor: "#fff",
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    minHeight: SIZES.height * 0.3,
  },
  quoteIcon: { marginBottom: SIZES.base * 2, opacity: 0.3 },
  quoteText: {
    fontSize: SIZES.h3,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: SIZES.h2,
    fontStyle: "italic",
    marginBottom: SIZES.base * 2,
  },
  sourceContainer: { alignItems: "center", marginBottom: SIZES.padding },
  quoteAuthor: { fontSize: SIZES.body4, color: "#555", fontWeight: "600" },
  pageText: { fontSize: SIZES.font, color: "#999", marginTop: SIZES.base / 4 },

  decoLine: {
    width: SIZES.padding * 1.5,
    height: SIZES.base / 2,
    backgroundColor: "#F0F0F0",
    borderRadius: SIZES.base / 4,
    marginBottom: SIZES.padding,
  },
  cardFooter: { fontSize: SIZES.body4 - 1, color: "#AAA" },

  // 하단 버튼
  actionContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 1.5, // iOS 하단 노치 고려
    backgroundColor: "#F7F8FA", // 배경색과 동일하게
  },
  mainButton: {
    backgroundColor: "#007AFF",
    borderRadius: SIZES.radius * 1.5,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding + SIZES.base,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  iconCircle: {
    width: SIZES.padding * 2.2,
    height: SIZES.padding * 2.2,
    borderRadius: SIZES.padding * 1.1,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.base * 2,
  },
  btnTextContainer: { flex: 1 },
  mainButtonTitle: {
    color: "white",
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.base / 2,
  },
  mainButtonDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: SIZES.font - 1,
  },
});
