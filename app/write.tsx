import { SIZES } from "@/constants/theme";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
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
          <Ionicons name="chevron-back" size={SIZES.h2} color="#375A4E" />
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
          style={[styles.aiButton, (!content || isFixing) && styles.aiButtonDisabled]}
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
              <Text style={styles.aiButtonText}>AI 다듬기</Text>
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

      <View
        style={[
          styles.bottomButtonContainer,
          { marginBottom: SIZES.padding * 1.25 + insets.bottom },
        ]}
      >
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
    backgroundColor: "#F7F5F0",
    paddingTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.base * 2,
  },
  backButton: { fontSize: SIZES.body3, color: "#375A4E" },
  headerTitle: { fontSize: SIZES.h3, fontWeight: "700", color: "#24332D" },

  pageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius * 1.15,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    paddingHorizontal: SIZES.base * 2,
    paddingVertical: SIZES.base,
    marginBottom: SIZES.padding,
  },
  pageInputLabel: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: "#405148",
    marginRight: SIZES.base,
  },
  pageInput: {
    flex: 1,
    fontSize: SIZES.body3,
    color: "#24332D",
  },

  aiButton: {
    flexDirection: "row",
    backgroundColor: "#557A68",
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
  aiButtonDisabled: { backgroundColor: "#AAB8AF" },

  inputContainer: {
    flex: 1,
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius * 1.25,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  textInput: {
    fontSize: SIZES.body3,
    lineHeight: SIZES.padding,
    color: "#24332D",
    flex: 1,
  },

  tagContainer: {
    marginBottom: SIZES.padding,
  },
  tagTitle: {
    fontSize: SIZES.body4,
    fontWeight: "600",
    color: "#647A6B",
    marginBottom: SIZES.base,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.base,
  },
  tag: {
    backgroundColor: "#EEF3EE",
    borderWidth: 1,
    borderColor: "#E0E9E0",
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 1.5,
  },
  selectedTag: {
    backgroundColor: "#375A4E",
  },
  tagText: {
    fontSize: SIZES.body4,
    color: "#557064",
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
    backgroundColor: "#375A4E",
  },
  secondaryButton: {
    backgroundColor: "#FFFDFC",
    borderWidth: 1,
    borderColor: "#375A4E",
  },
  buttonText: {
    fontSize: SIZES.body3,
    fontWeight: "bold",
  },
  primaryButtonText: {
    color: "white",
  },
  secondaryButtonText: {
    color: "#375A4E",
  },
});
