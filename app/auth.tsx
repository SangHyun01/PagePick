import { SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuthViewModel } from "@/view-models/useAuthViewModel";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
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
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    isLoginMode,
    canSubmit,
    openPrivacyPolicy,
    toggleMode,
    handleSubmit,
  } = useAuthViewModel();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Ionicons name="library" size={SIZES.largeTitle} color="#007AFF" />
        <Text style={styles.title}>내 손안의 서재</Text>
        <Text style={styles.subtitle}>
          {isLoginMode
            ? "로그인하여 서재를 확인하세요"
            : "새로운 계정을 만들어보세요"}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={SIZES.h3}
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

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={SIZES.h3}
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
              size={SIZES.h3}
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.mainButton,
              !canSubmit && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
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

        <TouchableOpacity style={styles.switchButton} onPress={toggleMode}>
          <Text style={styles.switchButtonText}>
            {isLoginMode
              ? "계정이 없으신가요? 회원가입"
              : "이미 계정이 있으신가요? 로그인"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.privacyButton}
          onPress={openPrivacyPolicy}
        >
          <Text style={styles.privacyButtonText}>개인정보처리방침</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: SIZES.padding,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: SIZES.padding * 1.5 },
  title: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: "#333",
    marginTop: SIZES.base,
  },
  subtitle: { fontSize: SIZES.body3, color: "#888", marginTop: SIZES.base / 2 },
  form: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  icon: { marginRight: SIZES.base },
  input: {
    flex: 1,
    fontSize: SIZES.body3,
    color: "#333",
    height: SIZES.padding * 1.7,
  },
  buttonContainer: { marginTop: SIZES.base },
  button: {
    padding: SIZES.base * 2,
    borderRadius: SIZES.radius,
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
  mainButtonText: { color: "#fff", fontSize: SIZES.body3, fontWeight: "bold" },
  switchButton: {
    marginTop: SIZES.padding,
    alignItems: "center",
    padding: SIZES.base,
  },
  switchButtonText: { color: "#666", fontSize: SIZES.body4 },
  privacyButton: {
    marginTop: SIZES.padding,
    alignItems: "center",
    padding: SIZES.base,
  },
  privacyButtonText: {
    color: "#999",
    fontSize: SIZES.body4,
    textDecorationLine: "underline",
  },
  disabledButton: {
    backgroundColor: "#A9D3FF",
    shadowOpacity: 0,
    elevation: 0,
  },
});
