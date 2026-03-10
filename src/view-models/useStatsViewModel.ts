import * as bookService from "@/services/bookService";
import { getAllUserSentences } from "@/services/sentenceService";
import * as userService from "@/services/userService";
import { UserProfile } from "@/types/auth";
import { Sentence } from "@/types/sentence";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

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

export interface MonthlyBookStat {
  value: number;
  label: string;
  delta: number;
}

export const useStatsViewModel = () => {
  const [markedDates, setMarkedDates] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [allSentences, setAllSentences] = useState<Sentence[]>([]);
  const [totalSentencesCount, setTotalSentencesCount] = useState<number>(0);
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [monthlyBookStats, setMonthlyBookStats] = useState<MonthlyBookStat[]>(
    [],
  );
  const [totalFinishedBooks, setTotalFinishedBooks] = useState(0);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateSentences, setSelectedDateSentences] = useState<
    Sentence[]
  >([]);
  const [continuousReadingDays, setContinuousReadingDays] = useState(0);
  const [streakProgress, setStreakProgress] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showCongratsAnimation, setShowCongratsAnimation] = useState(false);
  const [showStreakRewardModal, setShowStreakRewardModal] = useState(false);
  const [streakRewardMessage, setStreakRewardMessage] = useState("");

  // 로컬(한국) 기준 YYYY-MM-DD 포맷을 뽑아주는 헬퍼 함수
  const getLocalDateString = useCallback((dateInput: string | Date) => {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const calculateEffectiveStreak = useCallback(
    (
      lastReadDate: string | null,
      frozenDates: Set<string>,
      today: string,
      readDates: Set<string>,
    ): number => {
      if (!lastReadDate && frozenDates.size === 0 && !readDates.has(today)) {
        return 0;
      }

      let streak = 0;
      let currentDate = new Date(today);

      if (!readDates.has(today) && !frozenDates.has(today)) {
        currentDate.setDate(currentDate.getDate() - 1);
      }

      const earliestActivityDate = new Date(
        Math.min(
          ...(lastReadDate ? [new Date(lastReadDate).getTime()] : []),
          ...Array.from(frozenDates).map((d) => new Date(d).getTime()),
          ...Array.from(readDates).map((d) => new Date(d).getTime()),
        ),
      );

      while (currentDate >= earliestActivityDate) {
        const dateString = getLocalDateString(currentDate);

        if (readDates.has(dateString) || frozenDates.has(dateString)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    },
    [getLocalDateString],
  );

  const checkAndGrantStreakReward = useCallback(
    async (profile: UserProfile, currentStreak: number) => {
      const today = getLocalDateString(new Date());
      const lastReadDate = profile.last_read_date
        ? getLocalDateString(profile.last_read_date)
        : null;

      // 보상은 오늘 독서 활동으로 달성했을 때만 지급
      if (lastReadDate !== today) {
        return;
      }

      const lastRewardDate = profile.last_reward_date
        ? getLocalDateString(profile.last_reward_date)
        : null;

      if (
        currentStreak > 0 &&
        currentStreak % 7 === 0 &&
        lastRewardDate !== today
      ) {
        try {
          const newFreezeCount = (profile.streak_freezes || 0) + 1;

          await userService.grantStreakReward(
            profile.id,
            newFreezeCount,
            today,
          );

          setUserProfile((prev) =>
            prev
              ? {
                  ...prev,
                  streak_freezes: newFreezeCount,
                  last_reward_date: today,
                }
              : null,
          );

          setStreakRewardMessage(
            `7일 연속 기록을 달성하여 보호권 1개를 획득했어요!\n(현재 보유량: ${newFreezeCount}개)`,
          );
          setShowCongratsAnimation(true);
        } catch (error) {
          console.error("Failed to grant streak reward:", error);
          Alert.alert("오류", "보상 지급에 실패했습니다.");
        }
      }
    },
    [getLocalDateString],
  );

  useFocusEffect(
    useCallback(() => {
      const fetchStatsAndProfile = async () => {
        try {
          setIsLoading(true);
          const [sentences, books, profile] = await Promise.all([
            getAllUserSentences(),
            bookService.fetchBooks(),
            userService.getUserProfile(),
          ]);

          setAllSentences(sentences);
          setTotalSentencesCount(sentences.length);

          const countsByDate = sentences.reduce(
            (acc, sentence) => {
              const dateOnly = getLocalDateString(sentence.create_at);
              acc[dateOnly] = (acc[dateOnly] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );

          if (!profile) {
            setIsLoading(false);
            return;
          }
          setUserProfile(profile);

          const frozenDatesSet = new Set(profile.frozen_dates || []);

          const marks: any = {};

          frozenDatesSet.forEach((date) => {
            marks[date] = {
              customStyles: {
                container: {
                  backgroundColor: "#ADD8E6",
                  borderRadius: 4,
                },
                text: {
                  color: "black",
                  fontWeight: "bold",
                },
              },
            };
          });

          const readingDates = Object.keys(countsByDate);
          readingDates.forEach((date) => {
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

            const existingMark = marks[date] || {};
            marks[date] = {
              ...existingMark,
              customStyles: {
                ...(existingMark.customStyles || {}),
                container: {
                  ...(existingMark.customStyles?.container || {}),
                  backgroundColor: bgColor,
                  borderRadius: 4,
                },
                text: {
                  ...(existingMark.customStyles?.text || {}),
                  color: textColor,
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

          // 월별 완독 책 통계 (누적 차트용)
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;

          const finishedBooksThisYear = books.filter((book) => {
            if (book.status === "finished" && book.finished_at) {
              const finishedDate = new Date(book.finished_at);
              return finishedDate.getFullYear() === currentYear;
            }
            return false;
          });

          const monthlyCounts = new Array(12).fill(0);
          finishedBooksThisYear.forEach((book) => {
            const month = new Date(book.finished_at!).getMonth();
            monthlyCounts[month]++;
          });

          const cumulativeStats: MonthlyBookStat[] = [];
          let cumulativeSum = 0;
          for (let i = 0; i < currentMonth; i++) {
            cumulativeSum += monthlyCounts[i];
            cumulativeStats.push({
              value: cumulativeSum,
              label: `${i + 1}월`,
              delta: monthlyCounts[i],
            });
          }
          setMonthlyBookStats(cumulativeStats);
          setTotalFinishedBooks(cumulativeSum);

          // 사용자 프로필 가져오기 및 연속 기록 처리

          const today = getLocalDateString(new Date());
          const lastReadDate = profile.last_read_date
            ? getLocalDateString(profile.last_read_date)
            : null;
          const hasReadToday = lastReadDate === today;

          const readDatesSet = new Set(Object.keys(countsByDate));
          const effectiveStreak = calculateEffectiveStreak(
            lastReadDate,
            frozenDatesSet,
            today,
            readDatesSet,
          );
          setContinuousReadingDays(effectiveStreak);

          let displayStreakValue = effectiveStreak;

          // 7일 주기를 채웠고, 오늘 아직 읽지 않았다면 게이지를 0으로 표시
          if (
            effectiveStreak > 0 &&
            effectiveStreak % 7 === 0 &&
            !hasReadToday
          ) {
            displayStreakValue = 0;
          }

          const displayStreak =
            displayStreakValue > 0 && displayStreakValue % 7 === 0
              ? 7
              : displayStreakValue % 7;
          setStreakProgress(displayStreak / 7);

          checkAndGrantStreakReward(profile, effectiveStreak);
        } catch (error) {
          console.error("통계 데이터 불러오기 실패:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStatsAndProfile();
    }, [
      checkAndGrantStreakReward,
      calculateEffectiveStreak,
      getLocalDateString,
    ]),
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

  const handleCongratsAnimationFinish = () => {
    setShowCongratsAnimation(false);
    setShowStreakRewardModal(true);
  };

  const handleStreakRewardModalFinish = () => {
    setShowStreakRewardModal(false);
  };

  return {
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
    userProfile,
    showCongratsAnimation,
    showStreakRewardModal,
    streakRewardMessage,
    handleCongratsAnimationFinish,
    handleStreakRewardModalFinish,
  };
};
