import { SIZES } from "@/constants/theme";
import { useAuthViewModel } from "@/view-models/useAuthViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
      color={isDestructive ? "#C69088" : "#A2AEA5"}
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

interface ExportCardProps {
  onPress: () => void;
}

const ExportCard = ({ onPress }: ExportCardProps) => (
  <TouchableOpacity style={styles.exportCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.exportIconCircle}>
      <Ionicons name="share-outline" size={SIZES.h2} color="#375A4E" />
    </View>
    <View style={styles.exportTextContainer}>
      <Text style={styles.exportTitle}>나의 독서 기록 내보내기</Text>
      <Text style={styles.exportDescription}>
        책, 문장, 메모와 리뷰를 한곳에 정리해요
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={SIZES.h3} color="#557A68" />
  </TouchableOpacity>
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
  }, [getUserProfile]);

  const handleExportPress = () => {
    Alert.alert(
      "독서 기록 내보내기",
      "노션으로 나의 독서 기록을 정리하는 기능을 준비하고 있어요.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 프로필 정보 */}
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>내 정보</Text>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={SIZES.h1} color="#fff" />
          </View>
          <Text style={styles.emailText}>{userEmail || "로딩 중..."}</Text>
          <Text style={styles.profileSubtext}>PagePick과 함께 기록하는 독서</Text>
        </View>

        <SectionHeader title="데이터 관리" />
        <ExportCard onPress={handleExportPress} />

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
    backgroundColor: "#F7F5F0",
  },
  scrollContent: {
    paddingBottom: SIZES.padding * 2,
  },
  profileCard: {
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 1.15,
    paddingBottom: SIZES.padding * 1.15,
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    alignItems: "center",
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius * 1.5,
    borderWidth: 1,
    borderColor: "#E6E4DC",
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileTitle: {
    alignSelf: "flex-start",
    color: "#24332D",
    fontSize: SIZES.h2,
    fontWeight: "700",
    marginBottom: SIZES.padding,
  },
  avatarContainer: {
    width: SIZES.padding * 3,
    height: SIZES.padding * 3,
    borderRadius: SIZES.padding * 1.5,
    backgroundColor: "#375A4E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.base * 1.5,
  },
  emailText: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: "#24332D",
  },
  profileSubtext: {
    color: "#87958C",
    fontSize: SIZES.body4 - 2,
    marginTop: SIZES.base / 2,
  },
  sectionHeader: {
    fontSize: SIZES.body4 - 2,
    fontWeight: "700",
    color: "#78857E",
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  exportCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SIZES.padding,
    padding: SIZES.padding * 0.7,
    backgroundColor: "#EAF1EA",
    borderRadius: SIZES.radius * 1.25,
    borderWidth: 1,
    borderColor: "#D8E5D8",
  },
  exportIconCircle: {
    width: SIZES.padding * 2,
    height: SIZES.padding * 2,
    borderRadius: SIZES.padding,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDFC",
    marginRight: SIZES.base * 1.5,
  },
  exportTextContainer: {
    flex: 1,
  },
  exportTitle: {
    color: "#24332D",
    fontSize: SIZES.body3,
    fontWeight: "700",
    marginBottom: SIZES.base / 2,
  },
  exportDescription: {
    color: "#647A6B",
    fontSize: SIZES.body4 - 2,
  },
  menuContainer: {
    backgroundColor: "#FFFDFC",
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius * 1.25,
    borderWidth: 1,
    borderColor: "#E6E4DC",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.base * 1.85,
    paddingRight: SIZES.base * 2,
    marginLeft: SIZES.base * 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8E9E3",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: SIZES.body3,
    color: "#405148",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: SIZES.body3,
    color: "#87958C",
  },
  destructiveText: {
    color: "#B85C52",
  },
});
