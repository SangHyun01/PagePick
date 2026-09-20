import { SIZES } from "@/constants/theme";
import { showToast } from "@/lib/appFeedback";
import * as userService from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
      showToast("재설정 메일을 보냈어요. 메일함을 확인해 주세요.", "success");
      router.back();
    } catch (error) {
      console.error("Password reset request failed:", error);
      showToast("요청에 실패했어요. 잠시 후 다시 시도해 주세요.", "error");
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
          <Ionicons name="chevron-back" size={SIZES.h2} color="#375A4E" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={SIZES.h2} color="#375A4E" />
          </View>
          <Text style={styles.title}>비밀번호를 잊으셨나요?</Text>
          <Text style={styles.description}>
            가입할 때 사용한 이메일을 입력하면{`\n`}비밀번호를 다시 설정할 수 있는 링크를 보내드려요.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={SIZES.h3} color="#557A68" />
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
  keyboardAvoidingView: { flex: 1, backgroundColor: "#F7F5F0" },
  scrollContent: { flexGrow: 1, padding: SIZES.padding },
  backButton: { paddingVertical: SIZES.base, alignSelf: "flex-start" },
  content: { flex: 1, justifyContent: "center", paddingBottom: SIZES.largeTitle },
  iconCircle: {
    width: SIZES.padding * 3,
    height: SIZES.padding * 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.padding * 1.5,
    backgroundColor: "#E8F0E9",
    marginBottom: SIZES.base,
  },
  title: {
    marginTop: SIZES.padding,
    fontSize: SIZES.h1,
    fontWeight: "700",
    color: "#24332D",
  },
  description: {
    marginTop: SIZES.base,
    color: "#78857E",
    fontSize: SIZES.body4,
    lineHeight: SIZES.body3 * 1.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: SIZES.radius * 1.15,
    backgroundColor: "#FFFDFC",
    marginTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.base * 1.5,
    gap: SIZES.base,
  },
  input: { flex: 1, height: SIZES.padding * 1.7, fontSize: SIZES.body3, color: "#24332D" },
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: SIZES.padding * 1.5,
    padding: SIZES.base * 2,
    borderRadius: SIZES.radius,
    backgroundColor: "#375A4E",
  },
  disabledButton: { backgroundColor: "#AAB8AF" },
  buttonText: { color: "#fff", fontSize: SIZES.body3, fontWeight: "bold" },
});
