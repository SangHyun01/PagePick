import { SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import * as userService from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

type RecoveryStatus = "loading" | "ready" | "error";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<RecoveryStatus>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRecoveryUrl = useCallback(async (url: string) => {
    setStatus("loading");
    try {
      await userService.createRecoverySessionFromUrl(url);
      setStatus("ready");
    } catch (error) {
      console.error("Password recovery link failed:", error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const initializeRecovery = async () => {
      // 앱이 실행 중일 때는 루트 레이아웃이 먼저 복구 세션을 만들 수 있다.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setStatus("ready");
        return;
      }

      const url = await Linking.getInitialURL();
      if (url) await handleRecoveryUrl(url);
      else setStatus("error");
    };

    void initializeRecovery();

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleRecoveryUrl(url);
    });

    return () => subscription.remove();
  }, [handleRecoveryUrl]);

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      Alert.alert("확인", "비밀번호는 6자리 이상으로 입력해 주세요.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("확인", "비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      await userService.updatePassword(password);
      Alert.alert("비밀번호를 변경했어요", "새 비밀번호로 다시 로그인해 주세요.", [
        {
          text: "로그인하기",
          onPress: () => {
            void supabase.auth.signOut();
            router.replace("/auth");
          },
        },
      ]);
    } catch (error) {
      console.error("Password update failed:", error);
      Alert.alert("변경 실패", "비밀번호를 변경하지 못했습니다. 링크를 다시 요청해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.statusText}>재설정 링크를 확인하고 있어요.</Text>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={SIZES.largeTitle} color="#E05252" />
        <Text style={styles.title}>링크를 확인할 수 없어요</Text>
        <Text style={styles.errorDescription}>
          링크가 만료되었거나 이미 사용되었을 수 있습니다.{`\n`}새 재설정 메일을 요청해 주세요.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/forgot-password")}>
          <Text style={styles.buttonText}>재설정 메일 다시 보내기</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <View style={styles.content}>
          <Ionicons name="lock-closed-outline" size={SIZES.largeTitle} color="#007AFF" />
          <Text style={styles.title}>새 비밀번호 설정</Text>
          <Text style={styles.description}>새로 사용할 비밀번호를 입력해 주세요.</Text>

          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="새 비밀번호 (6자리 이상)"
          />
          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="새 비밀번호 확인"
          />

          <TouchableOpacity
            style={[
              styles.button,
              (password === "" || confirmPassword === "" || submitting) && styles.disabledButton,
            ]}
            onPress={handleUpdatePassword}
            disabled={password === "" || confirmPassword === "" || submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>비밀번호 변경</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PasswordInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name="lock-closed-outline" size={SIZES.h3} color="#666" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: SIZES.padding },
  keyboardAvoidingView: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, padding: SIZES.padding },
  centered: { alignItems: "center", justifyContent: "center" },
  content: { flex: 1, justifyContent: "center", paddingBottom: SIZES.largeTitle },
  title: { marginTop: SIZES.padding, fontSize: SIZES.h1, fontWeight: "bold", color: "#333" },
  description: { marginTop: SIZES.base, color: "#666", fontSize: SIZES.body4 },
  statusText: { marginTop: SIZES.padding, color: "#666", fontSize: SIZES.body4 },
  errorDescription: {
    marginTop: SIZES.base,
    color: "#666",
    fontSize: SIZES.body4,
    lineHeight: SIZES.body3 * 1.5,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: SIZES.padding * 1.5,
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
