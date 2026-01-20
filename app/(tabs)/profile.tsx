import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SIZES } from "@/constants/theme";

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>("");

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
  },
  logoutText: {
    fontSize: SIZES.body3,
    color: "#FF3B30",
    fontWeight: "bold",
  },
});
