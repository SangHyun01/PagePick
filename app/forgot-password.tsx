import { SIZES } from "@/constants/theme";
import * as userService from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = useMemo(() => email.trim() !== "" && !loading, [email, loading]);

  const handleSendResetEmail = async () => {
    setLoading(true);
    try {
      await userService.requestPasswordReset(email.trim());
      Alert.alert(
        "재설정 메일을 보냈어요",
        "입력한 이메일이 가입되어 있다면 비밀번호 재설정 링크가 전송됩니다. 메일함을 확인해 주세요.",
        [{ text: "확인", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Password reset request failed:", error);
      Alert.alert("요청 실패", "잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={SIZES.h2} color="#333" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Ionicons name="key-outline" size={SIZES.largeTitle} color="#007AFF" />
          <Text style={styles.title}>비밀번호를 잊으셨나요?</Text>
          <Text style={styles.description}>
            가입할 때 사용한 이메일을 입력하면{`\n`}비밀번호를 다시 설정할 수 있는 링크를 보내드려요.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={SIZES.h3} color="#666" />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일 주소"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.disabledButton]}
            onPress={handleSendResetEmail}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>재설정 메일 보내기</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, padding: SIZES.padding },
  backButton: { paddingVertical: SIZES.base, alignSelf: "flex-start" },
  content: { flex: 1, justifyContent: "center", paddingBottom: SIZES.largeTitle },
  title: {
    marginTop: SIZES.padding,
    fontSize: SIZES.h1,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    marginTop: SIZES.base,
    color: "#666",
    fontSize: SIZES.body4,
    lineHeight: SIZES.body3 * 1.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: SIZES.padding * 2,
    paddingBottom: SIZES.base,
    gap: SIZES.base,
  },
  input: { flex: 1, height: SIZES.padding * 1.7, fontSize: SIZES.body3, color: "#333" },
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: SIZES.padding * 1.5,
    padding: SIZES.base * 2,
    borderRadius: SIZES.radius,
    backgroundColor: "#007AFF",
  },
  disabledButton: { backgroundColor: "#A9D3FF" },
  buttonText: { color: "#fff", fontSize: SIZES.body3, fontWeight: "bold" },
});
