import BottomSheet from "@/components/BottomSheet";
import CongratsModal from "@/components/CongratsModal";
import SentenceList from "@/components/SentenceList";
import StreakProgressBar from "@/components/StreakProgressBar"; // Import the new component
import StreakRewardModal from "@/components/StreakRewardModal";
import { SIZES } from "@/constants/theme";
import { useStatsViewModel } from "@/view-models/useStatsViewModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { PieChart } from "react-native-chart-kit";

LocaleConfig.locales["kr"] = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "kr";

const screenWidth = Dimensions.get("window").width;

const sections = ["calendar", "streak", "piechart"]; // Add "streak" to sections

export default function StatsScreen() {
  const {
    isLoading,
    markedDates,
    tagStats,
    totalSentencesCount,
    onDayPress,
    isSheetVisible,
    closeSheet,
    selectedDate,
    selectedDateSentences,
    continuousReadingDays,
    streakProgress,
    showCongratsAnimation,
    showStreakRewardModal,
    streakRewardMessage,
    handleCongratsAnimationFinish,
    handleStreakRewardModalFinish,
    userProfile,
  } = useStatsViewModel();

  const totalTags = tagStats.reduce((sum, stat) => sum + stat.count, 0);

  const chartConfig = {
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  };

  const renderItem = ({ item }: { item: string }) => {
    if (item === "calendar") {
      return (
        <View style={styles.calendarContainer}>
          <Calendar
            markingType={"custom"}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#b6c1cd",
              selectedDayBackgroundColor: "#00adf5",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#007AFF",
              dayTextColor: "#2d4150",
              textDisabledColor: "#d9e1e8",
              arrowColor: "#007AFF",
              monthTextColor: "#333",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "bold",
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
            onDayPress={onDayPress}
          />
        </View>
      );
    }

    if (item === "streak") {
      return (
        <View style={styles.chartSectionContainer}>
          <Text style={styles.sectionTitle}>연속 독서 챌린지</Text>
          <StreakProgressBar
            continuousReadingDays={continuousReadingDays}
            streakProgress={streakProgress}
            streakFreezes={userProfile?.streak_freezes || 0}
          />
        </View>
      );
    }

    if (item === "piechart") {
      return (
        <View style={styles.chartSectionContainer}>
          <Text style={styles.sectionTitle}>태그 분석</Text>
          {tagStats.length > 0 ? (
            <View style={styles.chartWrapper}>
              <View style={styles.chartAndLegend}>
                <PieChart
                  data={tagStats}
                  width={screenWidth * 0.45}
                  height={screenWidth * 0.45}
                  chartConfig={chartConfig}
                  accessor={"count"}
                  backgroundColor={"transparent"}
                  paddingLeft={"0"}
                  center={[25, 0]}
                  absolute
                  hasLegend={false}
                />
                <View style={styles.legendContainer}>
                  {tagStats.map((stat) => (
                    <View key={stat.name} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: stat.color },
                        ]}
                      />
                      <Text style={styles.legendText}>{stat.name}</Text>
                      <Text style={styles.legendPercentage}>
                        {((stat.count / totalTags) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={styles.totalSentencesText}>
                수집한 문장: {totalSentencesCount}개
              </Text>
            </View>
          ) : (
            <View style={styles.emptyChartContainer}>
              <Text style={styles.emptyChartText}>분석할 태그가 없습니다.</Text>
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>통계 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        ListHeaderComponent={
          <Text style={styles.headerTitle}>나의 독서 통계</Text>
        }
        contentContainerStyle={{ paddingBottom: SIZES.padding * 2 }}
      />
      <BottomSheet isVisible={isSheetVisible} onClose={closeSheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{selectedDate} 기록</Text>
          <TouchableOpacity onPress={closeSheet}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <SentenceList sentences={selectedDateSentences} />
      </BottomSheet>
      <CongratsModal
        visible={showCongratsAnimation}
        onFinish={handleCongratsAnimationFinish}
      />
      <StreakRewardModal
        visible={showStreakRewardModal}
        onFinish={handleStreakRewardModalFinish}
        message={streakRewardMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    paddingTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    color: "#333",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: SIZES.body4,
    color: "#666",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartSectionContainer: {
    marginTop: SIZES.padding * 2,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.base,
  },
  totalSentencesText: {
    fontSize: SIZES.body4,
    color: "#888",
    textAlign: "center",
    marginTop: SIZES.padding,
  },
  chartWrapper: {
    backgroundColor: "#fff",
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartAndLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendContainer: {
    flex: 1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.base,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.base,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
  },
  legendPercentage: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    backgroundColor: "#f9f9f9",
    borderRadius: SIZES.radius,
  },
  emptyChartText: {
    color: "#999",
    fontSize: SIZES.body4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: SIZES.padding,
  },
  sheetTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
  },
});
