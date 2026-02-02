import { SIZES } from "@/constants/theme";
import { useAuthViewModel } from "@/view-models/useAuthViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const {
    userEmail,
    getUserProfile,
    openPrivacyPolicy,
    handleLogout,
    handleDeleteAccount,
  } = useAuthViewModel();

  useEffect(() => {
    getUserProfile();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={SIZES.h1} color="#fff" />
        </View>
        <Text style={styles.emailText}>{userEmail || "로딩 중..."}</Text>
      </View>

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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={SIZES.h3}
          color="#FF3B30"
          style={{ marginRight: SIZES.base }}
        />
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.privacyButton}
        onPress={openPrivacyPolicy}
      >
        <Text style={styles.privacyButtonText}>개인정보처리방침</Text>
      </TouchableOpacity>

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
