import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function WriteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [content, setContent] = useState<string>("");
  const [page, setPage] = useState<string>(""); // 페이지 번호 상태 추가

  useEffect(() => {
    if (params.text) {
      const incomingText = Array.isArray(params.text)
        ? params.text[0]
        : params.text;
      setContent(incomingText);
    }
  }, [params.text]);

  const handleSave = () => {
    if (!page) {
      Alert.alert("알림", "페이지를 입력해주세요.");
      return;
    }

    Alert.alert(
      "저장 완료!",
      `p.${page}

"${content}"

문장이 보관함에 저장되었습니다.`
    );
    router.dismissAll();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문장 다듬기 ✏️</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 페이지 입력 필드 추가 */}
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

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>보관함에 저장</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: { fontSize: 16, color: "#007AFF" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },

  // 페이지 입력 스타일
  pageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  pageInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 10,
  },
  pageInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  inputContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  textInput: { fontSize: 16, lineHeight: 24, color: "#333", flex: 1 },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
