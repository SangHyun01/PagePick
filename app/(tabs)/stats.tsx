import BottomSheet from "@/components/BottomSheet";
import CongratsModal from "@/components/CongratsModal";
import SentenceList from "@/components/SentenceList";
import StreakProgressBar from "@/components/StreakProgressBar"; // Import the new component
import StreakRewardModal from "@/components/StreakRewardModal";
import { SIZES } from "@/constants/theme";
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
import { PieChart } from "react-native-chart-kit"; // PieChart만 유지, BarChart는 gifted-charts에서 가져옴
import { BarChart as GiftedBarChart } from "react-native-gifted-charts"; // 명칭 충돌 방지

// ... (상단 import 부분 수정 필요)

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
    color: (opacity = 1) => `rgba(85, 122, 104, ${opacity})`,
  };

  const renderItem = ({ item }: { item: string }) => {
    if (item === "calendar") {
      return (
        <View style={styles.calendarContainer}>
          <Calendar
            markingType={"custom"}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#FFFDFC",
              calendarBackground: "#FFFDFC",
              textSectionTitleColor: "#87958C",
              selectedDayBackgroundColor: "#375A4E",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#557A68",
              dayTextColor: "#405148",
              textDisabledColor: "#D6DDD6",
              arrowColor: "#375A4E",
              monthTextColor: "#24332D",
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
      const currentMonthIndex = new Date().getMonth();
      const currentMonthStat =
        monthlyBookStats.length > 0
          ? monthlyBookStats[currentMonthIndex]
          : null;

      const previousMonthStat =
        currentMonthIndex > 0 && monthlyBookStats.length > 0
          ? monthlyBookStats[currentMonthIndex - 1]
          : null;

      const diff =
        currentMonthStat && previousMonthStat
          ? currentMonthStat.delta - previousMonthStat.delta
          : currentMonthStat
            ? currentMonthStat.delta
            : 0;

      const getDiffInfo = () => {
        if (diff > 0)
          return {
            icon: "caret-up",
            color: "#557A68",
            text: `${diff}`,
          };
        if (diff < 0)
          return { icon: "caret-down", color: "#FF5252", text: `${diff}` };
        return { icon: "remove", color: "#888", text: "0" };
      };

      const diffInfo = getDiffInfo();
      const cardInnerWidth = screenWidth - scale(120);
      const barWidth = scale(10);
      const initialSpacing = scale(12);
      const dynamicSpacing =
        (cardInnerWidth - barWidth * 12 - initialSpacing * 2) / 11;

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
                  <Text style={styles.deltaLabel}>전월 대비</Text>
                  <View
                    style={[
                      styles.deltaValueWrapper,
                      { backgroundColor: `${diffInfo.color}1A` },
                    ]}
                  >
                    <Ionicons
                      name={diffInfo.icon as any}
                      size={scale(12)}
                      color={diffInfo.color}
                    />
                    <Text
                      style={[styles.deltaValue, { color: diffInfo.color }]}
                    >
                      {diffInfo.text}권
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {monthlyBookStats.length > 0 ? (
              <View
                style={{
                  marginTop: scale(20),
                  marginLeft: scale(-25),
                  alignItems: "center",
                }}
              >
                <GiftedBarChart
                  data={monthlyBookStats}
                  width={cardInnerWidth}
                  spacing={dynamicSpacing}
                  barWidth={barWidth}
                  roundedTop
                  roundedBottom
                  disableScroll
                  frontColor="#557A68"
                  initialSpacing={initialSpacing}
                  noOfSections={3}
                  maxValue={Math.max(
                    5,
                    Math.ceil(
                      Math.max(...monthlyBookStats.map((s) => s.delta || 0)) *
                        1.5,
                    ),
                  )}
                  roundToDigits={0}
                  height={scale(180)}
                  yAxisColor="#DDE4DC"
                  yAxisThickness={0}
                  rulesType="solid"
                  rulesColor="#E8EDE7"
                  yAxisTextStyle={{ color: "#87958C", fontSize: fontScale(9) }}
                  xAxisColor="#DDE4DC"
                  xAxisLabelTextStyle={{
                    color: "#87958C",
                    fontSize: fontScale(8),
                    width: screenWidth * 0.06,
                    textAlign: "center",
                  }}
                  renderTooltip={(item: any, index: number) => {
                    if (item.value === undefined) return null;
                    const isLast = index >= 9;
                    return (
                      <View
                        style={{
                          marginBottom: scale(5),
                          marginLeft: isLast ? scale(-45) : scale(-15),
                        }}
                      >
                        <View style={styles.pointerLabel}>
                          <Text style={styles.pointerLabelMonth}>
                            {item.label}
                          </Text>
                          <Text style={styles.pointerLabelValue}>
                            {item.delta}권
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                  leftShiftForTooltip={scale(10)}
                  activeOpacity={0.7}
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
        <ActivityIndicator size="large" color="#375A4E" />
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
            <Ionicons name="close" size={24} color="#375A4E" />
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
    backgroundColor: "#F7F5F0",
  },
  headerTitle: {
    fontSize: SIZES.h1 + 2,
    fontWeight: "700",
    paddingTop: SIZES.padding * 1.5,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding * 0.8,
    color: "#24332D",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: SIZES.body4,
    color: "#78857E",
  },
  calendarContainer: {
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius * 1.5,
    borderWidth: 1,
    borderColor: "#E6E4DC",
    marginHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartSectionContainer: {
    marginTop: SIZES.padding * 1.5,
    paddingHorizontal: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    marginBottom: SIZES.base,
    color: "#405148",
  },
  totalSentencesText: {
    fontSize: SIZES.body4,
    color: "#78857E",
    textAlign: "center",
    marginTop: SIZES.padding,
  },
  chartWrapper: {
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius * 1.5,
    borderWidth: 1,
    borderColor: "#E6E4DC",
    padding: SIZES.padding,
    shadowColor: "#3A493F",
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
    backgroundColor: "#EEF2ED",
    borderRadius: SIZES.radius * 1.25,
  },
  emptyChartText: {
    color: "#87958C",
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
    fontWeight: "700",
    color: "#24332D",
  },
  bookStatsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  bookStatsLabel: {
    fontSize: 12,
    color: "#87958C",
    marginBottom: 4,
  },
  bookStatsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#24332D",
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
    color: "#87958C",
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
    color: "#557A68",
    marginLeft: 2,
  },
  pointerLabel: {
    backgroundColor: "rgba(55, 90, 78, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pointerLabelMonth: {
    color: "#D9E6DA",
    fontSize: 10,
    marginBottom: 2,
  },
  pointerLabelValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
