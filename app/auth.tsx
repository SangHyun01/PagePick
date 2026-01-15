import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function AuthScreen() {
  const router = useRouter();

  // 상태 변수들
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 로그인 모드인지, 회원가입 모드인지
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 로그인
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      Alert.alert("로그인 실패", error.message);
      setLoading(false);
    }
  }

  // 회원가입
  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert("알림", "비밀번호가 일치하지 않습니다.\n다시 확인해주세요.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("알림", "비밀번호는 6자리 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (error) {
      Alert.alert("회원가입 실패", error.message);
      setLoading(false);
    } else {
      Alert.alert("환영합니다!", "회원가입이 완료되었습니다.");
    }
  }

  // 버튼 눌렀을 때 실행할 함수 분기
  const handleSubmit = () => {
    if (isLoginMode) {
      signInWithEmail();
    } else {
      signUpWithEmail();
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Ionicons name="library" size={60} color="#007AFF" />
        <Text style={styles.title}>내 손안의 서재</Text>
        <Text style={styles.subtitle}>
          {isLoginMode
            ? "로그인하여 서재를 확인하세요"
            : "새로운 계정을 만들어보세요"}
        </Text>
      </View>

      <View style={styles.form}>
        {/* 이메일 입력 */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="이메일 주소"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* 비밀번호 입력 */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            placeholder="비밀번호 (6자리 이상)"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        </View>

        {!isLoginMode && (
          <View style={styles.inputContainer}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry={true}
              placeholder="비밀번호 확인"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* 메인 버튼 (로그인 or 회원가입) */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.mainButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.mainButtonText}>
                {isLoginMode ? "로그인" : "회원가입"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 모드 전환 버튼 (텍스트) */}
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            // 모드 바꿀 때 입력한 것들 초기화
            setIsLoginMode(!isLoginMode);
            setPassword("");
            setConfirmPassword("");
          }}
        >
          <Text style={styles.switchButtonText}>
            {isLoginMode
              ? "계정이 없으신가요? 회원가입"
              : "이미 계정이 있으신가요? 로그인"}
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
    padding: 20,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginTop: 10 },
  subtitle: { fontSize: 15, color: "#888", marginTop: 5 },
  form: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 20,
    paddingBottom: 10,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#333", height: 40 }, // 높이 명시
  buttonContainer: { marginTop: 10 },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mainButton: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  switchButton: { marginTop: 20, alignItems: "center", padding: 10 },
  switchButtonText: { color: "#666", fontSize: 14 },
});
