import { SIZES } from "@/src/constants/theme";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>("");

  // 개인정보처리방침 URL
  const privacyPolicyUrl =
    "https://www.notion.so/PagePick-2f00ea70703080659305d1735208f6ba?source=copy_link";

  const openPrivacyPolicy = () => {
    WebBrowser.openBrowserAsync(privacyPolicyUrl).catch((err) =>
      Alert.alert("알림", "페이지를 여는 데 실패했습니다."),
    );
  };

  useEffect(() => {
    // 화면이 켜지면 현재 로그인한 사용자 정보 가져오기
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "이메일 정보 없음");
    }
  };

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          // Supabase에 로그아웃 요청
          const { error } = await supabase.auth.signOut();

          if (error) {
            Alert.alert("오류", "로그아웃 실패");
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
              // 현재 세션 가져오기
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (!session) return;

              // 탈퇴 함수 호출
              const { error } = await supabase.functions.invoke(
                "delete-account",
                {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                },
              );

              if (error) throw error;

              await supabase.auth.signOut();
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

  return (
    <View style={styles.container}>
      {/* 프로필 카드 영역 */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={SIZES.h1} color="#fff" />
        </View>
        <Text style={styles.emailText}>{userEmail}</Text>
      </View>

      {/* 메뉴 리스트 */}
      <View style={styles.menuContainer}>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>내 독서 통계 (준비중)</Text>
          <Ionicons name="chevron-forward" size={SIZES.h3} color="#ccc" />
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>앱 설정 (준비중)</Text>
          <Ionicons name="chevron-forward" size={SIZES.h3} color="#ccc" />
        </View>
      </View>

      {/* 로그아웃 버튼 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={SIZES.h3}
          color="#FF3B30"
          style={{ marginRight: SIZES.base }}
        />
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 개인정보처리방침 링크 */}
      <TouchableOpacity
        style={styles.privacyButton}
        onPress={openPrivacyPolicy}
      >
        <Text style={styles.privacyButtonText}>개인정보처리방침</Text>
      </TouchableOpacity>

      {/* 회원탈퇴 버튼 */}
      <TouchableOpacity
        style={styles.deleteAccountButton}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.deleteAccountText}>회원탈퇴</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2.5,
  },

  // 프로필 카드
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding * 1.25,
    alignItems: "center",
    marginBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    width: SIZES.padding * 3.3,
    height: SIZES.padding * 3.3,
    borderRadius: SIZES.padding * 1.65,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.base * 2,
  },
  emailText: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: "#333",
    marginBottom: SIZES.base / 2,
  },
  roleText: {
    fontSize: SIZES.body4,
    color: "#888",
  },

  // 메뉴 리스트
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.base * 2.2,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: SIZES.body3,
    color: "#333",
  },

  // 로그아웃 버튼
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: SIZES.base * 2.2,
    borderRadius: SIZES.radius,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
  logoutText: {
    fontSize: SIZES.body3,
    color: "#FF3B30",
    fontWeight: "bold",
  },

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
  deleteAccountButton: {
    marginTop: SIZES.base,
    alignItems: "center",
    padding: SIZES.base,
  },
  deleteAccountText: {
    color: "#999",
    fontSize: SIZES.body4,
    textDecorationLine: "underline",
  },
});
