import { Colors, SIZES } from "@/constants/theme";
import { useWriteViewModel } from "@/view-models/useWriteViewModel";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TAGS = [
  "인사이트",
  "동기부여",
  "위로/공감",
  "기타",
  "유머/재미",
  "표현력",
  "핵심요약",
  "충격/반전",
];

export default function WriteScreen() {
  const {
    content,
    setContent,
    page,
    setPage,
    isFixing,
    selectedTags,
    handleAiFix,
    handleTagSelect,
    navigateToNext,
    router,
  } = useWriteViewModel();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={SIZES.h2} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문장 다듬기</Text>
        <View style={{ width: SIZES.padding }} />
      </View>

      <View style={styles.pageInputContainer}>
        <Text style={styles.pageInputLabel}>페이지</Text>
        <TextInput
          style={styles.pageInput}
          value={page}
          onChangeText={setPage}
          placeholder="번호 입력"
          keyboardType="number-pad"
          placeholderTextColor="#687076"
        />
      </View>

      <View style={{ alignItems: "flex-end", marginBottom: SIZES.base }}>
        <TouchableOpacity
          onPress={handleAiFix}
          disabled={isFixing || !content}
          style={styles.aiButton}
        >
          {isFixing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="sparkles"
                size={SIZES.h3}
                color="#fff"
                style={{ marginRight: SIZES.base }}
              />
              <Text style={styles.aiButtonText}>AI 맞춤법 교정</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="여기에 문장이 들어옵니다."
          textAlignVertical="top"
        />
      </View>

      <View style={styles.tagContainer}>
        <Text style={styles.tagTitle}>태그 (선택)</Text>
        <View style={styles.tagList}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                selectedTags.includes(tag) && styles.selectedTag,
              ]}
              onPress={() => handleTagSelect(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.selectedTagText,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigateToNext("/select-book")}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            책 선택
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.base * 2,
  },
  backButton: { fontSize: SIZES.body3, color: "#007AFF" },
  headerTitle: { fontSize: SIZES.h3, fontWeight: "bold" },

  pageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: SIZES.radius * 0.8,
    paddingHorizontal: SIZES.base * 2,
    paddingVertical: SIZES.base,
    marginBottom: SIZES.padding,
  },
  pageInputLabel: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: "#333",
    marginRight: SIZES.base,
  },
  pageInput: {
    flex: 1,
    fontSize: SIZES.body3,
    color: "#333",
  },

  aiButton: {
    flexDirection: "row",
    backgroundColor: "#4d76ff",
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 2,
    borderRadius: SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
  },
  aiButtonText: {
    color: "#fff",
    fontSize: SIZES.body4,
    fontWeight: "600",
  },

  inputContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  textInput: {
    fontSize: SIZES.body3,
    lineHeight: SIZES.padding,
    color: "#333",
    flex: 1,
  },

  tagContainer: {
    marginBottom: SIZES.padding,
  },
  tagTitle: {
    fontSize: SIZES.body4,
    fontWeight: "600",
    color: Colors.light.icon,
    marginBottom: SIZES.base,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.base,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 1.5,
  },
  selectedTag: {
    backgroundColor: Colors.light.tint,
  },
  tagText: {
    fontSize: SIZES.body4,
    color: Colors.light.text,
  },
  selectedTagText: {
    color: "white",
    fontWeight: "bold",
  },

  bottomButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.padding * 1.25,
    gap: SIZES.base,
  },
  button: {
    flex: 1,
    padding: SIZES.base * 2,
    borderRadius: SIZES.radius * 0.8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  buttonText: {
    fontSize: SIZES.body3,
    fontWeight: "bold",
  },
  primaryButtonText: {
    color: "white",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
});
