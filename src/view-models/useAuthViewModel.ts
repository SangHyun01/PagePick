import * as userService from "@/services/userService";
import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

export const useAuthViewModel = () => {
  // 인증 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  // 개인정보처리방침
  const privacyPolicyUrl =
    "https://www.notion.so/PagePick-2f00ea70703080659305d1735208f6ba?source=copy_link";

  const openPrivacyPolicy = () => {
    WebBrowser.openBrowserAsync(privacyPolicyUrl).catch(() =>
      Alert.alert("알림", "페이지를 여는 데 실패했습니다."),
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
    isLoginMode,
    canSubmit,
    toggleMode,
    handleSubmit,
    userEmail,
    getUserProfile,
    handleLogout,
    handleDeleteAccount,
    openPrivacyPolicy,
  };
};
