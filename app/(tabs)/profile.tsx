import { SIZES, Colors } from "@/constants/theme";
import { useAuthViewModel } from "@/view-models/useAuthViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MenuItemProps {
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
  isLast?: boolean;
}

const MenuItem = ({
  label,
  onPress,
  isDestructive = false,
  isLast = false,
}: MenuItemProps) => (
  <TouchableOpacity
    style={[styles.menuItem, isLast && styles.lastMenuItem]}
    onPress={onPress}
  >
    <Text style={[styles.menuText, isDestructive && styles.destructiveText]}>
      {label}
    </Text>
    <Ionicons
      name="chevron-forward"
      size={SIZES.h4}
      color={isDestructive ? Colors.light.icon : "#ccc"}
    />
  </TouchableOpacity>
);

interface InfoItemProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const InfoItem = ({ label, value, isLast = false }: InfoItemProps) => (
  <View style={[styles.menuItem, isLast && styles.lastMenuItem]}>
    <Text style={styles.menuText}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function ProfileScreen() {
  const {
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
  } = useAuthViewModel();

  useEffect(() => {
    getUserProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 프로필 정보 */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={SIZES.h1} color="#fff" />
          </View>
          <Text style={styles.emailText}>{userEmail || "로딩 중..."}</Text>
        </View>

        {/* 커뮤니티 & 문의 */}
        <SectionHeader title="커뮤니티 & 문의" />
        <View style={styles.menuContainer}>
          <MenuItem
            label="PagePick 인스타그램"
            onPress={() => openUrl(instagramDeepLink, instagramUrl)}
          />
          <MenuItem label="개발자에게 문의하기" onPress={contactDeveloper} />
          <MenuItem
            label="공지사항"
            onPress={() => openUrl(announcementsUrl)}
            isLast
          />
        </View>

        {/* 앱정보 */}
        <SectionHeader title="앱정보" />
        <View style={styles.menuContainer}>
          <MenuItem
            label="서비스 이용약관"
            onPress={() => openUrl(termsOfServiceUrl)}
          />
          <MenuItem
            label="개인정보 처리방침"
            onPress={() => openUrl(privacyPolicyUrl)}
          />
          <InfoItem label="앱 버전" value={appVersion} isLast />
        </View>

        {/* 계정 관리 */}
        <SectionHeader title="계정 관리" />
        <View style={styles.menuContainer}>
          <MenuItem label="로그아웃" onPress={handleLogout} />
          <MenuItem
            label="회원 탈퇴"
            onPress={handleDeleteAccount}
            isDestructive
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  profileCard: {
    padding: SIZES.padding,
    paddingBottom: SIZES.base * 2,
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  avatarContainer: {
    width: SIZES.padding * 3,
    height: SIZES.padding * 3,
    borderRadius: SIZES.padding * 1.5,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.base * 1.5,
  },
  emailText: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  sectionHeader: {
    fontSize: SIZES.body4,
    color: Colors.light.icon,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.base * 2,
    marginLeft: SIZES.base * 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: SIZES.body3,
    color: Colors.light.text,
  },
  infoValue: {
    fontSize: SIZES.body3,
    color: Colors.light.icon,
  },
  destructiveText: {
    color: "#FF3B30",
  },
});
