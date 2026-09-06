import { SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StreakProgressBarProps {
  continuousReadingDays: number;
  streakProgress: number;
  streakFreezes: number;
  maxStreak: number;
}

const StreakProgressBar: React.FC<StreakProgressBarProps> = ({
  continuousReadingDays,
  streakProgress,
  streakFreezes,
  maxStreak,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.streakText}>
          현재 연속 {continuousReadingDays}일째
        </Text>
        <View style={styles.streakFreezeContainer}>
          <Ionicons name="shield-half-outline" size={16} color="#ADD8E6" />
          <Text style={styles.streakFreezeLabel}>보호권:</Text>
          <Text style={styles.streakFreezeText}>{streakFreezes}</Text>
        </View>
      </View>
      <View style={styles.percentageRow}>
        <Text style={styles.currentStreakText}>🏆 최고 기록 {maxStreak}일</Text>
        <Text style={styles.progressPercentage}>
          {(streakProgress * 100).toFixed(0)}%
        </Text>
      </View>
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${streakProgress * 100}%` },
            ]}
          />
        </View>
        {streakProgress > 0 && (
          <LottieView
            source={require("../assets/animations/Flame.json")}
            autoPlay
            loop
            style={[
              styles.flameAnimationAbsolute,
              { left: `${streakProgress * 100}%` },
            ]}
          />
        )}
      </View>
      <Text style={styles.description}>7일 연속으로 문장을 수집해보세요</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius * 1.5,
    borderWidth: 1,
    borderColor: "#E6E4DC",
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.base,
  },
  streakText: {
    fontSize: SIZES.body3,
    fontWeight: "700",
    color: "#24332D",
  },
  streakFreezeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakFreezeLabel: {
    fontSize: SIZES.body4,
    color: "#78857E",
    marginLeft: 4,
    marginRight: 4,
  },
  streakFreezeText: {
    fontSize: SIZES.body4,
    fontWeight: "bold",
    color: "#ADD8E6",
  },
  percentageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: SIZES.base * 2,
  },
  currentStreakText: {
    fontSize: SIZES.body4,
    color: "#78857E",
  },
  progressPercentage: {
    fontSize: SIZES.body4,
    color: "#78857E",
  },
  progressBarWrapper: {
    position: "relative",
    marginBottom: SIZES.base,
    height: 16,
  },
  progressBarBackground: {
    height: "100%",
    backgroundColor: "#E7EDE6",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#557A68",
    borderRadius: 8,
  },
  flameAnimationAbsolute: {
    width: 60,
    height: 60,
    position: "absolute",
    transform: [{ translateX: -27 }, { translateY: -26 }],
    zIndex: 1,
  },
  description: {
    fontSize: SIZES.body4,
    color: "#78857E",
    textAlign: "center",
    marginTop: SIZES.base,
  },
});

export default StreakProgressBar;
