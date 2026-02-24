import BottomSheet from "@/components/BottomSheet";
import SentenceList from "@/components/SentenceList";
import { SIZES } from "@/constants/theme";
import { useStatsViewModel } from "@/view-models/useStatsViewModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

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

export default function StatsScreen() {
  const {
    isLoading,
    markedDates,
    onDayPress,
    isSheetVisible,
    closeSheet,
    selectedDate,
    selectedDateSentences,
  } = useStatsViewModel();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>나의 독서 캘린더</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>달력을 불러오는 중입니다...</Text>
        </View>
      ) : (
        <View style={styles.calendarContainer}>
          <Calendar
            // custom 스타일
            markingType={"custom"}
            markedDates={markedDates}
            // 달력 상단 헤더 스타일
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
            // 날짜를 눌렀을 때
            onDayPress={onDayPress}
          />
        </View>
      )}

      <BottomSheet isVisible={isSheetVisible} onClose={closeSheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{selectedDate} 기록</Text>
          <TouchableOpacity onPress={closeSheet}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <SentenceList sentences={selectedDateSentences} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: SIZES.padding * 3,
    paddingHorizontal: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    marginBottom: SIZES.padding,
    color: "#333",
  },
  loadingContainer: {
    marginTop: 50,
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
    paddingBottom: SIZES.padding,
    // 그림자 효과
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
