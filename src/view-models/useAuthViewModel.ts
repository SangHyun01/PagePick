import { supabase } from "@/lib/supabase";
import * as userService from "@/services/userService";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import Constans from "expo-constants";
import { useMemo, useState } from "react";
import { Alert, Linking } from "react-native";

const GOOGLE_WEB_CLIENT_ID = Constans.expoConfig?.extra?.googleWebClientId;

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

export const useAuthViewModel = () => {
  // 인증 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 프로필 정보를 위한 상태
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (isLoginMode) {
      return email.trim() !== "" && password.trim() !== "";
    }
    return (
      email.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== ""
    );
  }, [email, password, confirmPassword, isLoginMode, loading]);

  const privacyPolicyUrl =
    "https://www.notion.so/PagePick-2f00ea70703080659305d1735208f6ba?source=copy_link";
  const instagramUrl = "https://www.instagram.com/pagepick.official/";
  const instagramDeepLink = "instagram://_u/pagepick.official";
  const developerEmail = "simon010809@gmail.com";
  const announcementsUrl =
    "https://www.notion.so/PagePick-3040ea7070308053a72cdeea98896833?source=copy_link";
  const termsOfServiceUrl =
    "https://www.notion.so/PagePick-3040ea70703080718bdee52005e2ef1d?source=copy_link";
  const appVersion = "1.0.0";

  const openUrl = async (url: string, fallbackUrl?: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else if (fallbackUrl) {
        await Linking.openURL(fallbackUrl);
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert("알림", "페이지를 여는 데 실패했습니다.");
    }
  };

  const contactDeveloper = () => {
    const mailtoUrl = `mailto:${developerEmail}`;
    Linking.openURL(mailtoUrl).catch(() =>
      Alert.alert("알림", "메일 앱을 열 수 없습니다."),
    );
  };

  // // 로그인/회원가입 전환 토글
  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isLoginMode) {
        await userService.signIn({ email: email.trim(), password });
      } else {
        if (password !== confirmPassword) {
          throw new Error("비밀번호가 일치하지 않습니다.\n다시 확인해주세요.");
        }
        if (password.length < 6) {
          throw new Error("비밀번호는 6자리 이상이어야 합니다.");
        }
        await userService.signUp({ email: email.trim(), password });
        Alert.alert("환영합니다!", "회원가입이 완료되었습니다.");
      }
    } catch (error: any) {
      const errorMessage = isLoginMode
        ? "가입한 정보와 일치하지 않습니다."
        : error.message;
      Alert.alert(isLoginMode ? "로그인 실패" : "회원가입 실패", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setSocialLoading(true);
    try {
      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();

      if (response.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.data.idToken,
        });

        if (error) throw error;
        console.log("User logged in:", data.user?.email);
      } else {
        return;
      }
    } catch (error: any) {
      // 구글 SDK에서 발생한 에러인지 체크
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("사용자가 로그인을 취소했습니다.");
            return;

          case statusCodes.IN_PROGRESS:
            console.log("이미 로그인 진행 중입니다.");
            return;

          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("오류", "구글 플레이 서비스를 사용할 수 없습니다.");
            return;
        }
      }
      console.error("Google Login Error:", error);
      Alert.alert(
        "로그인 실패",
        error.message || "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setSocialLoading(false);
    }
  };

  // 프로필 정보
  const getUserProfile = async () => {
    try {
      const user = await userService.getUser();
      if (user) {
        setUserEmail(user.email || "이메일 정보 없음");
      }
    } catch (e) {
      console.error(e);
      setUserEmail("정보를 불러올 수 없습니다.");
    }
  };

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await userService.signOut();
          } catch (e) {
            Alert.alert("오류", "로그아웃에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await userService.deleteAccount();
              Alert.alert("완료", "회원 탈퇴가 완료되었습니다.");
            } catch (e: any) {
              Alert.alert("오류", "탈퇴 처리 중 문제가 발생했습니다.");
              console.error(e);
            }
          },
        },
      ],
    );
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    socialLoading,
    isLoginMode,
    canSubmit,
    toggleMode,
    handleSubmit,
    signInWithGoogle,
    userEmail,
    getUserProfile,
    handleLogout,
    handleDeleteAccount,
    openUrl,
    contactDeveloper,
    instagramUrl,
    instagramDeepLink,
    announcementsUrl,
    termsOfServiceUrl,
    privacyPolicyUrl,
    appVersion,
  };
};
