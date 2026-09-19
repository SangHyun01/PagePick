import { SIZES } from "@/constants/theme";
import { trackEvent } from "@/lib/analytics";
import { useAuthViewModel } from "@/view-models/useAuthViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
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

interface NotionPremiumCardProps {
  onPress: () => void;
}

const NotionPremiumCard = ({ onPress }: NotionPremiumCardProps) => (
  <TouchableOpacity
    style={styles.exportCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.exportIconCircle}>
      <Ionicons name="lock-closed" size={SIZES.h3} color="#375A4E" />
    </View>
    <View style={styles.exportTextContainer}>
      <View style={styles.exportTitleRow}>
        <Text style={styles.exportTitle}>노션 아카이브 동기화</Text>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>PREMIUM</Text>
        </View>
      </View>
      <Text style={styles.exportDescription}>
        나만의 노션 책장으로 기록을 자동 정리해요
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={SIZES.h3} color="#557A68" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const [isNotionPremiumModalVisible, setIsNotionPremiumModalVisible] =
    useState(false);
  const [isNotionInterestModalVisible, setIsNotionInterestModalVisible] =
    useState(false);
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

  const handleNotionPremiumPress = () => {
    trackEvent("notion_paywall_viewed", { source: "profile" });
    setIsNotionPremiumModalVisible(true);
  };

  const handleNotionPremiumInterest = () => {
    trackEvent("notion_premium_interest_registered", { source: "profile" });
    setIsNotionPremiumModalVisible(false);
    setIsNotionInterestModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent
        visible={isNotionPremiumModalVisible}
        onRequestClose={() => setIsNotionPremiumModalVisible(false)}
      >
        <View style={styles.premiumModalOverlay}>
          <View style={styles.premiumModalCard}>
            <TouchableOpacity
              style={styles.premiumCloseButton}
              onPress={() => setIsNotionPremiumModalVisible(false)}
              accessibilityLabel="노션 프리미엄 안내 닫기"
            >
              <Ionicons name="close" size={SIZES.h3} color="#78857E" />
            </TouchableOpacity>

            <View style={styles.premiumModalIcon}>
              <Ionicons name="book-outline" size={SIZES.h1} color="#375A4E" />
            </View>
            <View style={styles.premiumModalBadge}>
              <Text style={styles.premiumModalBadgeText}>PAGEPICK PREMIUM</Text>
            </View>
            <Text style={styles.premiumModalTitle}>나만의 독서 아카이브를{`\n`}노션에 옮겨보세요</Text>
            <Text style={styles.premiumModalDescription}>
              책, 문장, 메모와 리뷰를 한곳에 정리해{`\n`}언제든 다시 꺼내볼 수 있어요.
            </Text>

            <View style={styles.premiumFeatureList}>
              <View style={styles.premiumFeatureRow}>
                <Ionicons name="checkmark-circle" size={SIZES.h4} color="#557A68" />
                <Text style={styles.premiumFeatureText}>책별 문장과 메모를 자동 정리</Text>
              </View>
              <View style={styles.premiumFeatureRow}>
                <Ionicons name="checkmark-circle" size={SIZES.h4} color="#557A68" />
                <Text style={styles.premiumFeatureText}>내 노션 페이지로 안전하게 백업</Text>
              </View>
            </View>

            <Text style={styles.premiumComingSoon}>결제 기능을 준비 중이에요</Text>
            <View style={styles.premiumModalButtons}>
              <TouchableOpacity
                style={styles.premiumSecondaryButton}
                onPress={() => setIsNotionPremiumModalVisible(false)}
              >
                <Text style={styles.premiumSecondaryButtonText}>나중에</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.premiumPrimaryButton}
                onPress={handleNotionPremiumInterest}
              >
                <Text style={styles.premiumPrimaryButtonText}>관심 있어요</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent
        visible={isNotionInterestModalVisible}
        onRequestClose={() => setIsNotionInterestModalVisible(false)}
      >
        <View style={styles.premiumModalOverlay}>
          <View style={styles.interestModalCard}>
            <View style={styles.interestModalIcon}>
              <Ionicons name="heart" size={SIZES.h1} color="#B85C52" />
            </View>
            <Text style={styles.interestModalTitle}>관심 표시가 저장됐어요</Text>
            <Text style={styles.interestModalDescription}>
              더 좋은 노션 아카이브 기능으로{`\n`}준비해둘게요.
            </Text>
            <TouchableOpacity
              style={styles.interestModalButton}
              onPress={() => setIsNotionInterestModalVisible(false)}
            >
              <Text style={styles.interestModalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
        <NotionPremiumCard onPress={handleNotionPremiumPress} />

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
  exportTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.base,
    marginBottom: SIZES.base / 2,
  },
  exportTitle: {
    color: "#24332D",
    fontSize: SIZES.body3,
    fontWeight: "700",
  },
  premiumBadge: {
    backgroundColor: "#375A4E",
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.base,
    paddingVertical: 2,
  },
  premiumBadgeText: {
    color: "#FFFFFF",
    fontSize: SIZES.body4 - 4,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  premiumModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.padding,
    backgroundColor: "rgba(36, 51, 45, 0.46)",
  },
  premiumModalCard: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    paddingHorizontal: SIZES.padding * 1.25,
    paddingVertical: SIZES.padding * 1.5,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    backgroundColor: "#FFFEFA",
    shadowColor: "#24332D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  premiumCloseButton: {
    position: "absolute",
    top: SIZES.base,
    right: SIZES.base,
    padding: SIZES.base,
  },
  premiumModalIcon: {
    width: SIZES.padding * 3,
    height: SIZES.padding * 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.padding * 1.5,
    backgroundColor: "#E8F0E9",
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
  },
  premiumModalBadge: {
    borderRadius: SIZES.radius,
    backgroundColor: "#EAF1EA",
    paddingHorizontal: SIZES.base * 1.25,
    paddingVertical: 4,
    marginBottom: SIZES.base * 1.5,
  },
  premiumModalBadgeText: {
    color: "#557A68",
    fontSize: SIZES.body4 - 4,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  premiumModalTitle: {
    color: "#24332D",
    fontSize: SIZES.h2,
    fontWeight: "700",
    lineHeight: SIZES.h2 * 1.35,
    textAlign: "center",
  },
  premiumModalDescription: {
    color: "#78857E",
    fontSize: SIZES.body4 - 1,
    lineHeight: SIZES.body4 * 1.55,
    textAlign: "center",
    marginTop: SIZES.base * 1.25,
  },
  premiumFeatureList: {
    alignSelf: "stretch",
    gap: SIZES.base,
    marginTop: SIZES.padding,
    padding: SIZES.padding * 0.8,
    borderRadius: SIZES.radius,
    backgroundColor: "#F2F6F1",
  },
  premiumFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.base,
  },
  premiumFeatureText: {
    color: "#405148",
    fontSize: SIZES.body4 - 1,
    fontWeight: "600",
  },
  premiumComingSoon: {
    color: "#87958C",
    fontSize: SIZES.body4 - 2,
    marginTop: SIZES.padding,
  },
  premiumModalButtons: {
    flexDirection: "row",
    gap: SIZES.base,
    width: "100%",
    marginTop: SIZES.base * 1.5,
  },
  premiumSecondaryButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SIZES.padding * 0.6,
    borderWidth: 1,
    borderColor: "#DCE5DD",
    borderRadius: SIZES.radius,
    backgroundColor: "#F2F5F1",
  },
  premiumSecondaryButtonText: {
    color: "#64736A",
    fontSize: SIZES.body3,
    fontWeight: "700",
  },
  premiumPrimaryButton: {
    flex: 1.25,
    alignItems: "center",
    paddingVertical: SIZES.padding * 0.6,
    borderRadius: SIZES.radius,
    backgroundColor: "#375A4E",
  },
  premiumPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: SIZES.body3,
    fontWeight: "700",
  },
  interestModalCard: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    paddingHorizontal: SIZES.padding * 1.25,
    paddingVertical: SIZES.padding * 1.5,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    backgroundColor: "#FFFEFA",
    shadowColor: "#24332D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  interestModalIcon: {
    width: SIZES.padding * 2.8,
    height: SIZES.padding * 2.8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SIZES.padding * 1.4,
    backgroundColor: "#F9ECE8",
    marginBottom: SIZES.padding,
  },
  interestModalTitle: {
    color: "#24332D",
    fontSize: SIZES.h3,
    fontWeight: "700",
  },
  interestModalDescription: {
    color: "#78857E",
    fontSize: SIZES.body4 - 1,
    lineHeight: SIZES.body4 * 1.55,
    textAlign: "center",
    marginTop: SIZES.base,
  },
  interestModalButton: {
    alignItems: "center",
    alignSelf: "stretch",
    paddingVertical: SIZES.padding * 0.6,
    marginTop: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: "#375A4E",
  },
  interestModalButtonText: {
    color: "#FFFFFF",
    fontSize: SIZES.body3,
    fontWeight: "700",
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
