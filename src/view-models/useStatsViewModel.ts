import { getAllUserSentences } from "@/services/sentenceService";
import { Sentence } from "@/types/sentence";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const useStatsViewModel = () => {
  const [markedDates, setMarkedDates] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
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
    onDayPress,
    isSheetVisible,
    closeSheet,
    selectedDate,
    selectedDateSentences,
  };
};
