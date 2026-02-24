import { SIZES } from "@/constants/theme";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StreakProgressBarProps {
  continuousReadingDays: number;
  streakProgress: number;
}

const StreakProgressBar: React.FC<StreakProgressBarProps> = ({
  continuousReadingDays,
  streakProgress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>연속 독서 현황</Text>
      <View style={styles.streakTextContainer}>
        <Text style={styles.streakText}>
          연속 독서 {continuousReadingDays}일째
        </Text>
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
    marginTop: SIZES.padding * 2,
    marginHorizontal: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: "#fff",
    borderRadius: SIZES.radius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.padding,
  },
  streakTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.base,
  },
  streakText: {
    fontSize: SIZES.body3,
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: SIZES.body4,
    color: "#888",
  },
  progressBarWrapper: {
    position: "relative",
    marginBottom: SIZES.base,
    height: 16,
  },
  progressBarBackground: {
    height: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FF8C00",
    borderRadius: 8,
  },
  flameAnimationAbsolute: {
    width: 50,
    height: 50,
    position: "absolute",
    transform: [{ translateX: -24 }, { translateY: -20 }],
    zIndex: 1,
  },
  description: {
    fontSize: SIZES.body4,
    color: "#888",
    textAlign: "center",
    marginTop: SIZES.base,
  },
});

export default StreakProgressBar;
