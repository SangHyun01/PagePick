import { SIZES } from "@/constants/theme";
import { useHomeViewModel } from "@/view-models/useHomeViewModel";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { quote, loading, isDefaultQuote } = useHomeViewModel();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>PagePick</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString()}의 영감
        </Text>
      </View>

      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.contentScrollViewContainer}
      >
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
              <Text style={styles.cardFooter}>
                {isDefaultQuote
                  ? "첫 문장을 수집해보세요!"
                  : "내가 수집한 문장 중 하나입니다"}
              </Text>
            </>
          )}
        </View>
      </ScrollView>

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
  contentScrollView: {
    flex: 1,
  },
  contentScrollViewContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
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
  pageText: { fontSize: SIZES.body4, color: "#999", marginTop: SIZES.base / 4 },
  decoLine: {
    width: SIZES.padding * 1.5,
    height: SIZES.base / 2,
    backgroundColor: "#F0F0F0",
    borderRadius: SIZES.base / 4,
    marginBottom: SIZES.padding,
  },
  cardFooter: { fontSize: SIZES.body4 - 1, color: "#AAA" },
  actionContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 1.5,
    backgroundColor: "#F7F8FA",
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
    fontSize: SIZES.body4 - 1,
  },
});
