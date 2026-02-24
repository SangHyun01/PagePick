import { getAllUserSentences } from "@/services/sentenceService";
import { Sentence } from "@/types/sentence";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

// 색상 생성 유틸리티
const generateColor = (index: number) => {
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#C9CBCF",
    "#a3e7ba",
  ];
  return colors[index % colors.length];
};

export interface TagStat {
  name: string;
  count: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export const useStatsViewModel = () => {
  const [markedDates, setMarkedDates] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
  const [totalSentencesCount, setTotalSentencesCount] = useState<number>(0);
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateSentences, setSelectedDateSentences] = useState<
    Sentence[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          setIsLoading(true);
          const sentences: Sentence[] = await getAllUserSentences();
          setAllSentences(sentences);
          setTotalSentencesCount(sentences.length);

          // 캘린더 데이터 처리
          const countsByDate = sentences.reduce(
            (acc, sentence) => {
              const dateOnly = sentence.create_at.split("T")[0];
              acc[dateOnly] = (acc[dateOnly] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );

          const marks: any = {};
          Object.keys(countsByDate).forEach((date) => {
            const count = countsByDate[date];
            let bgColor = "#ebedf0";
            let textColor = "black";

            if (count >= 5) {
              bgColor = "#196127";
              textColor = "white";
            } else if (count >= 3) {
              bgColor = "#239a3b";
              textColor = "white";
            } else if (count >= 1) {
              bgColor = "#7bc96f";
              textColor = "black";
            }

            marks[date] = {
              customStyles: {
                container: {
                  backgroundColor: bgColor,
                  borderRadius: 6,
                },
                text: {
                  color: textColor,
                  fontWeight: "bold",
                },
              },
            };
          });
          setMarkedDates(marks);

          // 태그 통계 처리
          const allTags = sentences.flatMap((s) => s.tags || []);
          const tagCounts = allTags.reduce(
            (acc, tag) => {
              acc[tag] = (acc[tag] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );

          const stats: TagStat[] = Object.entries(tagCounts)
            .map(([name, count], index) => ({
              name,
              count,
              color: generateColor(index),
              legendFontColor: "#333",
              legendFontSize: 14,
            }))
            .sort((a, b) => b.count - a.count); // 많이 사용된 순으로 정렬

          setTagStats(stats);
        } catch (error) {
          console.error("통계 데이터 불러오기 실패:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStats();
    }, []),
  );

  const onDayPress = (day: any) => {
    const dateStr = day.dateString;
    const sentencesForDate = allSentences.filter(
      (s) => s.create_at.split("T")[0] === dateStr,
    );

    if (sentencesForDate.length > 0) {
      setSelectedDate(dateStr);
      setSelectedDateSentences(sentencesForDate);
      setSheetVisible(true);
    }
  };

  const closeSheet = () => {
    setSheetVisible(false);
  };

  return {
    isLoading,
    markedDates,
    tagStats,
    totalSentencesCount,
    onDayPress,
    isSheetVisible,
    closeSheet,
    selectedDate,
    selectedDateSentences,
  };
};
