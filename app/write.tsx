import { SIZES } from "@/src/constants/theme";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [isFixing, setIsFixing] = useState(false); // AI 로딩 상태

  useEffect(() => {
    if (params.text) {
      const incomingText = Array.isArray(params.text)
        ? params.text[0]
        : params.text;
      setContent(incomingText);
    }
  }, [params.text]);

  // ai 교정 함수
  const handleAiFix = async () => {
    if (!content.trim()) {
      Alert.alert("알림", "교정할 문장이 없습니다.");
      return;
    }

    setIsFixing(true);
    try {
      // supabase edge function 호툴
      const { data, error } = await supabase.functions.invoke("ai-fix-text", {
        body: { text: content },
      });

      if (error) throw error;

      if (data?.fixedText) {
        setContent(data.fixedText); // 수정된 걸로 교체
        Alert.alert("완료", "문장의 맞춤법과 띄어쓰기가 교정되었어요!");
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsFixing(false);
    }
  };

  const navigateToNext = (pathname: "/select-book" | "/add-book") => {
    if (!page || !content) {
      Alert.alert("알림", "페이지와 문장을 모두 입력해주세요.");
      return;
    }
    // 다음 화면으로 문장과 페이지 정보 전달
    router.push({
      pathname: pathname as any,
      params: { content, page },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={SIZES.h2} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문장 다듬기</Text>
        <View style={{ width: SIZES.padding }} />
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

      {/* 하단 버튼 영역 */}
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

  // 하단 버튼 스타일
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
