import BottomSheet from "@/components/BottomSheet";
import CongratsModal from "@/components/CongratsModal";
import SentenceList from "@/components/SentenceList";
import StreakProgressBar from "@/components/StreakProgressBar"; // Import the new component
import StreakRewardModal from "@/components/StreakRewardModal";
import { Colors, SIZES } from "@/constants/theme";
import { fontScale, scale } from "@/utils/responsive";
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
import { LineChart } from "react-native-gifted-charts";

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

const sections = ["calendar", "streak", "piechart", "bookchart"]; // Add "streak" to sections

export default function StatsScreen() {
  const {
    isLoading,
    markedDates,
    tagStats,
    monthlyBookStats,
    totalFinishedBooks,
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
            maxStreak={userProfile?.max_streak || 0}
          />
        </View>
      );
    }

    if (item === "piechart") {
      return (
        <View style={styles.chartSectionContainer}>
          <Text style={styles.sectionTitle}>문장 취향 분석</Text>
          {tagStats.length > 0 ? (
            <View style={styles.chartWrapper}>
              <View style={styles.chartAndLegend}>
                <PieChart
                  data={tagStats}
                  width={scale(160)}
                  height={scale(160)}
                  chartConfig={chartConfig}
                  accessor={"count"}
                  backgroundColor={"transparent"}
                  paddingLeft={scale(25).toString()}
                  center={[0, 0]}
                  absolute
                  hasLegend={false}
                />
                <View style={[styles.legendContainer]}>
                  {tagStats.map((stat) => (
                    <View key={stat.name} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: stat.color },
                        ]}
                      />
                      <Text style={styles.legendText} numberOfLines={1}>
                        {stat.name}
                      </Text>
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

    if (item === "bookchart") {
      const currentMonthStat =
        monthlyBookStats.length > 0
          ? monthlyBookStats[monthlyBookStats.length - 1]
          : null;

      return (
        <View style={styles.chartSectionContainer}>
          <Text style={styles.sectionTitle}>올해의 독서 성장</Text>
          <View style={styles.chartWrapper}>
            <View style={styles.bookStatsHeader}>
              <View>
                <Text style={styles.bookStatsLabel}>누적 완독</Text>
                <Text style={styles.bookStatsValue}>
                  {totalFinishedBooks}
                  <Text style={styles.bookStatsUnit}> 권</Text>
                </Text>
              </View>
              {currentMonthStat && (
                <View style={styles.deltaContainer}>
                  <Text style={styles.deltaLabel}>이번 달</Text>
                  <View style={styles.deltaValueWrapper}>
                    <Ionicons
                      name="caret-up"
                      size={scale(12)}
                      color={Colors.light.tint}
                    />
                    <Text style={styles.deltaValue}>
                      {currentMonthStat.delta}권
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {monthlyBookStats.length > 0 ? (
              <View style={{ marginTop: scale(20), marginLeft: scale(-20) }}>
                <LineChart
                  data={monthlyBookStats}
                  areaChart
                  hideDataPoints
                  spacing={(screenWidth - scale(80)) / 6}
                  color={Colors.light.tint}
                  thickness={3}
                  startFillColor={Colors.light.tint}
                  endFillColor="rgba(20,184,166,0.01)"
                  startOpacity={0.4}
                  endOpacity={0.1}
                  initialSpacing={scale(20)}
                  noOfSections={3}
                  maxValue={Math.max(5, Math.ceil(totalFinishedBooks * 1.2))}
                  roundToDigits={0}
                  height={scale(180)}
                  yAxisColor="lightgray"
                  yAxisThickness={0}
                  rulesType="solid"
                  rulesColor="lightgray"
                  yAxisTextStyle={{ color: "gray", fontSize: fontScale(10) }}
                  xAxisColor="lightgray"
                  pointerConfig={{
                    pointerStripHeight: scale(160),
                    pointerStripColor: "lightgray",
                    pointerStripWidth: 2,
                    pointerColor: Colors.light.tint,
                    radius: scale(6),
                    pointerLabelWidth: scale(80),
                    pointerLabelHeight: scale(60),
                    pointerLabelComponent: (items: any) => {
                      return (
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            paddingTop: scale(30),
                          }}
                        >
                          <View style={styles.pointerLabel}>
                            <Text style={styles.pointerLabelMonth}>
                              {items[0].label}
                            </Text>
                            <Text style={styles.pointerLabelValue}>
                              {items[0].value}권
                            </Text>
                          </View>
                        </View>
                      );
                    },
                  }}
                />
              </View>
            ) : (
              <View style={styles.emptyChartContainer}>
                <Text style={styles.emptyChartText}>
                  올해 완독한 책이 없습니다.
                </Text>
              </View>
            )}
          </View>
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
        <SentenceList sentences={selectedDateSentences} isBottomSheet={true} />
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
  bookStatsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  bookStatsLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  bookStatsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  bookStatsUnit: {
    fontSize: 14,
    fontWeight: "normal",
  },
  deltaContainer: {
    alignItems: "flex-end",
  },
  deltaLabel: {
    fontSize: 10,
    color: "#888",
    marginBottom: 2,
  },
  deltaValueWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 184, 166, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deltaValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.light.tint,
    marginLeft: 2,
  },
  pointerLabel: {
    backgroundColor: "rgba(51, 51, 51, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pointerLabelMonth: {
    color: "#ccc",
    fontSize: 10,
    marginBottom: 2,
  },
  pointerLabelValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
