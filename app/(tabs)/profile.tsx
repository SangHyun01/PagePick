import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.emailText}>{userEmail}</Text>
      </View>

      {/* 메뉴 리스트 */}
      <View style={styles.menuContainer}>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>내 독서 통계 (준비중)</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>앱 설정 (준비중)</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </View>

      {/* 로그아웃 버튼 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#FF3B30"
          style={{ marginRight: 8 }}
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
    padding: 20,
    paddingTop: 60,
  },

  // 프로필 카드
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  emailText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  roleText: {
    fontSize: 14,
    color: "#888",
  },

  // 메뉴 리스트
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },

  // 로그아웃 버튼
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "bold",
  },
});
