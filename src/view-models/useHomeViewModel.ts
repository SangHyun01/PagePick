import {
  addReadingSession,
  getTodayReadingDuration,
} from "@/services/readingSessionService";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cancelAllScheduledNotifications,
  schedulePushNotification,
} from "@/lib/notifications";
import { AudioTrack } from "@/types/music";

// --- Helper Functions ---
const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export type Mode = "Timer" | "Stopwatch";

export const useHomeViewModel = (music: AudioTrack | null) => {
  // --- State ---
  // Timer/Stopwatch
  const [mode, setMode] = useState<Mode>("Stopwatch");
  const [time, setTime] = useState(0); // Live time for stopwatch or timer
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer specific
  const [timerTargetSeconds, setTimerTargetSeconds] = useState(25 * 60);
  const [timerJustFinished, setTimerJustFinished] = useState(false);

  // Today's Total Duration
  const [dbTodayDuration, setDbTodayDuration] = useState(0);

  // Modals
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isFinishReadingModalVisible, setIsFinishReadingModalVisible] =
    useState(false);

  // App State for background handling
  const appState = useRef(AppState.currentState);

  // --- Memoized Values for UI ---
  const formattedLiveTime = useMemo(() => formatTime(time), [time]);

  const formattedTodayTotalDuration = useMemo(() => {
    const currentSessionProgress =
      mode === "Stopwatch" && hasStarted ? time : 0;
    const totalTodaySeconds = dbTodayDuration + currentSessionProgress;

    if (totalTodaySeconds < 0) return "0시간 0분 0초";

    const hours = Math.floor(totalTodaySeconds / 3600);
    const minutes = Math.floor((totalTodaySeconds % 3600) / 60);
    const seconds = Math.floor(totalTodaySeconds % 60);

    return `${hours}시간 ${minutes}분 ${seconds}초`;
  }, [dbTodayDuration, time, mode, hasStarted]);

  // --- Data Fetching ---
  const fetchTodayDuration = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const duration = await getTodayReadingDuration(session.user.id);
      setDbTodayDuration(duration);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTodayDuration();
    }, [fetchTodayDuration]),
  );

  // --- Effects ---
  // Timer interval
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (mode === "Stopwatch") {
          setTime((prevTime) => prevTime + 1);
        } else if (mode === "Timer") {
          setTime((prevTime) => {
            if (prevTime > 1) {
              return prevTime - 1;
            }
            setTimerJustFinished(true);
            setIsActive(false);
            return 0;
          });
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, mode]);

  // Save session when timer finishes automatically
  useEffect(() => {
    if (timerJustFinished) {
      const session = {
        mode: "timer" as const,
        duration_seconds: timerTargetSeconds,
        goal_seconds: timerTargetSeconds,
        audio_track_id: music?.id ?? null,
      };
      addReadingSession(session)
        .then(() => fetchTodayDuration())
        .catch((error) => {
          console.error(
            "Failed to save reading session on timer completion:",
            error,
          );
        });
      setTimerJustFinished(false);
      setHasStarted(false);
    }
  }, [timerJustFinished, timerTargetSeconds, music, fetchTodayDuration]);

  // Background/Foreground AppState handling
  useEffect(() => {
    const STORAGE_KEY = "@PagePick:reading_session_bg";

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        const rawData = await AsyncStorage.getItem(STORAGE_KEY);
        if (rawData) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          const data = JSON.parse(rawData);
          const elapsed = Math.round((Date.now() - data.timestamp) / 1000);

          if (data.mode === "Stopwatch") {
            setTime(data.time + elapsed);
          } else if (data.mode === "Timer") {
            const newTime = data.time - elapsed;
            if (newTime <= 0) {
              setTime(0);
              setIsActive(false);
              setHasStarted(false);
              const session = {
                mode: "timer" as const,
                duration_seconds: data.timerTargetSeconds,
                goal_seconds: data.timerTargetSeconds,
                audio_track_id: music?.id ?? null,
              };
              addReadingSession(session)
                .then(() => fetchTodayDuration())
                .catch((error) =>
                  console.error("Failed to save session on resume:", error),
                );
            } else {
              setTime(newTime);
            }
          }
        }
      } else if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        if (isActive) {
          const data = {
            time,
            mode,
            timerTargetSeconds,
            timestamp: Date.now(),
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isActive, time, mode, timerTargetSeconds, music, fetchTodayDuration]);

  // --- Handlers ---
  const handleModeChange = (newMode: Mode) => {
    if (!isActive) {
      setMode(newMode);
      setTime(newMode === "Timer" ? timerTargetSeconds : 0);
      setHasStarted(false);
    }
  };

  const handleStartPause = async () => {
    if (mode === "Timer" && time === 0) return;
    if (!hasStarted) {
      setHasStarted(true);
    }

    if (isActive) {
      await cancelAllScheduledNotifications();
    } else {
      if (mode === "Timer" && time > 0) {
        await cancelAllScheduledNotifications();
        await schedulePushNotification(
          "PagePick",
          "설정한 시간이 모두 지났어요!",
          time,
        );
      }
    }
    setIsActive((prev) => !prev);
  };

  const handleConfirmFinishReading = async () => {
    cancelAllScheduledNotifications();

    if (hasStarted) {
      let duration_seconds = 0;
      if (mode === "Stopwatch") {
        duration_seconds = time;
      } else {
        duration_seconds = timerTargetSeconds - time;
      }

      if (duration_seconds < 0) duration_seconds = 0;

      if (duration_seconds > 0) {
        const session = {
          mode: mode.toLowerCase() as "timer" | "stopwatch",
          duration_seconds: duration_seconds,
          goal_seconds: mode === "Timer" ? timerTargetSeconds : null,
          audio_track_id: music?.id ?? null,
        };
        try {
          await addReadingSession(session);
          await fetchTodayDuration();
        } catch (error) {
          console.error("Failed to save reading session:", error);
        }
      }
    }

    setTime(mode === "Timer" ? timerTargetSeconds : 0);
    setHasStarted(false);
    setIsActive(false);
  };

  const handleSetTimer = (totalSeconds: number) => {
    setTimerTargetSeconds(totalSeconds);
    if (mode === "Timer") {
      setTime(totalSeconds);
    }
  };

  // Modal Handlers
  const openTimePicker = () => {
    if (mode === "Timer" && !isActive) {
      setIsPickerVisible(true);
    }
  };
  const closeTimePicker = () => setIsPickerVisible(false);
  const openFinishReadingModal = () => {
    if (!hasStarted) return;
    setIsActive(false);
    setIsFinishReadingModalVisible(true);
  };
  const closeFinishReadingModal = () => setIsFinishReadingModalVisible(false);

  return {
    // State
    mode,
    time,
    timerTargetSeconds,
    isActive,
    hasStarted,
    // UI Values
    formattedLiveTime,
    formattedTodayTotalDuration,
    // Handlers
    handleModeChange,
    handleStartPause,
    handleConfirmFinishReading,
    handleSetTimer,
    // Modals
    isPickerVisible,
    openTimePicker,
    closeTimePicker,
    isFinishReadingModalVisible,
    openFinishReadingModal,
    closeFinishReadingModal,
  };
};
