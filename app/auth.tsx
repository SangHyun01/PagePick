import { SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuthViewModel } from "@/view-models/useAuthViewModel";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
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
    openUrl,
    privacyPolicyUrl,
    toggleMode,
    handleSubmit,
    signInWithGoogle,
    socialLoading,
  } = useAuthViewModel();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.brand}>PagePick</Text>
        <Text style={styles.title}>나만의 독서 아카이브</Text>
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
            color="#557A68"
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
            color="#557A68"
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
              color="#557A68"
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

        {isLoginMode && (
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>
              비밀번호를 잊으셨나요?
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.mainButton,
              !canSubmit && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
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

        <View style={styles.socialLoginContainer}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={signInWithGoogle}
            disabled={socialLoading}
          >
            {socialLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Image
                  source={require("../src/assets/images/google.png")}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialButtonText}>Google로 로그인</Text>
              </>
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[styles.socialButton, styles.kakaoButton]}
            disabled={socialLoading}
          >
            <Ionicons
              name="chatbubble"
              size={SIZES.h3}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Kakao로 로그인</Text>
          </TouchableOpacity> */}
        </View>

        <TouchableOpacity
          style={styles.privacyButton}
          onPress={() => openUrl(privacyPolicyUrl)}
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
    backgroundColor: "#F7F5F0",
    padding: SIZES.padding,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: SIZES.padding * 1.75 },
  brand: {
    color: "#375A4E",
    fontSize: SIZES.h3,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: "700",
    color: "#24332D",
    marginTop: SIZES.base * 1.25,
  },
  subtitle: { fontSize: SIZES.body3, color: "#78857E", marginTop: SIZES.base },
  form: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E7DF",
    borderRadius: SIZES.radius * 1.15,
    backgroundColor: "#FFFDFC",
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.base * 1.5,
  },
  icon: { marginRight: SIZES.base },
  input: {
    flex: 1,
    fontSize: SIZES.body3,
    color: "#24332D",
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
    backgroundColor: "#375A4E",
    shadowColor: "#24332D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: { color: "#fff", fontSize: SIZES.body3, fontWeight: "bold" },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -SIZES.base,
    marginBottom: SIZES.base,
    paddingVertical: SIZES.base / 2,
  },
  forgotPasswordText: { color: "#557A68", fontSize: SIZES.body4, fontWeight: "600" },
  switchButton: {
    marginTop: SIZES.base,
    alignItems: "center",
    paddingVertical: SIZES.base,
  },
  switchButtonText: { color: "#557A68", fontSize: SIZES.body4, fontWeight: "600" },
  privacyButton: {
    marginTop: SIZES.padding * 1.5,
    alignItems: "center",
    padding: SIZES.base,
  },
  privacyButtonText: {
    color: "#87958C",
    fontSize: SIZES.body4,
    textDecorationLine: "underline",
  },
  disabledButton: {
    backgroundColor: "#AAB8AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  socialLoginContainer: {
    marginTop: SIZES.padding,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.base,
    marginBottom: SIZES.padding,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E1E7DF" },
  dividerText: { color: "#87958C", fontSize: SIZES.body4 },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.base * 1.8,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
  },
  googleButton: {
    backgroundColor: "#FFFDFC",
    borderWidth: 1,
    borderColor: "#E1E7DF",
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  socialIcon: {
    width: SIZES.h3,
    height: SIZES.h3,
    marginRight: SIZES.padding,
  },
  socialButtonText: {
    fontSize: SIZES.body3,
    fontWeight: "bold",
  },
  googleButtonText: {
    color: "#333",
  },
});
