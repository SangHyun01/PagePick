import { showDialog, showToast } from "@/lib/appFeedback";
import { supabase } from "@/lib/supabase";
import * as userService from "@/services/userService";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import Constans from "expo-constants";
import { useMemo, useState } from "react";
import { Linking } from "react-native";

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
  const developerEmail = "pagepick.help@gmail.com";
  const announcementsUrl =
    "https://www.notion.so/PagePick-3040ea7070308053a72cdeea98896833?source=copy_link";
  const termsOfServiceUrl =
    "https://www.notion.so/PagePick-3040ea70703080718bdee52005e2ef1d?source=copy_link";
  const appVersion = "1.2.2";

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
      console.log("에러 발생:", error);
      showToast("페이지를 여는 데 실패했습니다.", "error");
    }
  };

  const contactDeveloper = () => {
    const mailtoUrl = `mailto:${developerEmail}`;
    Linking.openURL(mailtoUrl).catch(() =>
      showToast("메일 앱을 열 수 없습니다.", "error"),
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
        showToast("회원가입이 완료되었습니다.", "success");
      }
    } catch (error: any) {
      const errorMessage = isLoginMode
        ? "가입한 정보와 일치하지 않습니다."
        : error.message;
      showToast(errorMessage, "error");
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
            showToast("구글 플레이 서비스를 사용할 수 없습니다.", "error");
            return;
        }
      }
      console.error("Google Login Error:", error);
      showToast(error.message || "알 수 없는 오류가 발생했습니다.", "error");
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
    showDialog({
      title: "로그아웃할까요?",
      description: "언제든 다시 로그인할 수 있어요.",
      actions: [
        { label: "취소" },
        {
          label: "로그아웃",
          tone: "destructive",
          onPress: async () => {
          try {
            await userService.signOut();
          } catch (e) {
            console.log("에러 발생: ", e);
            showToast("로그아웃에 실패했습니다.", "error");
          }
          },
        },
      ],
    });
  };

  const handleDeleteAccount = async () => {
    showDialog({
      title: "회원 탈퇴할까요?",
      description: "계정과 저장된 기록은 되돌릴 수 없어요.",
      actions: [
        { label: "취소" },
        {
          label: "탈퇴하기",
          tone: "destructive",
          onPress: async () => {
            try {
              await userService.deleteAccount();
              showToast("회원 탈퇴가 완료되었습니다.", "success");
            } catch (e: any) {
              showToast("탈퇴 처리 중 문제가 발생했습니다.", "error");
              console.error(e);
            }
          },
        },
      ],
    });
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
