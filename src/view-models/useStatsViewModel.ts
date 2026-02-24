import { getAllUserSentences } from "@/services/sentenceService";
import { Sentence } from "@/types/sentence";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export const useStatsViewModel = () => {
  const [markedDates, setMarkedDates] = useState<any>({});
  const [sentencesData, setSentencesData] = useState<Record<string, number>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          setIsLoading(true);
          const sentences: Sentence[] = await getAllUserSentences();

          const countsByDate = sentences.reduce(
            (acc, sentence) => {
              const dateOnly = sentence.create_at.split("T")[0];
              acc[dateOnly] = (acc[dateOnly] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );

          setSentencesData(countsByDate);

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
    const count = sentencesData[day.dateString] || 0;
    if (count > 0) {
      Alert.alert(
        "기록 확인",
        `${day.dateString}에\n${count}개의 문장을 수집하셨네요!`,
      );
    } else {
      Alert.alert("기록 확인", "이날은 수집한 문장이 없습니다.");
    }
  };

  return {
    isLoading,
    markedDates,
    onDayPress,
  };
};
