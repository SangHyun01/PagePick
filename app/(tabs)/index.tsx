import MusicPlayer from "@/components/MusicPlayer";
import { SIZES } from "@/constants/theme";
import { getTodaysMusic } from "@/services/musicService";
import { addReadingSession } from "@/services/readingSessionService";
import { AudioTrack } from "@/types/music";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  AppState,
  AppStateStatus,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


type Mode = "Timer" | "Stopwatch";


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



export default function HomeScreen() {
  const router = useRouter();
  const [music, setMusic] = useState<AudioTrack | null>(null);
  const [mode, setMode] = useState<Mode>("Stopwatch");
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const [timerTargetSeconds, setTimerTargetSeconds] = useState(25 * 60);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isFinishReadingModalVisible, setIsFinishReadingModalVisible] =
    useState(false);
  const [timerJustFinished, setTimerJustFinished] = useState(false);

  const [inputHours, setInputHours] = useState("00");
  const [inputMinutes, setInputMinutes] = useState("25");
  const [inputSeconds, setInputSeconds] = useState("00");

  useEffect(() => {
    const fetchMusic = async () => {
      const todaysMusic = await getTodaysMusic();
      setMusic(todaysMusic);
    };
    fetchMusic();
  }, []);

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

  useEffect(() => {
    if (timerJustFinished) {
      const session = {
        mode: "timer" as const,
        duration_seconds: timerTargetSeconds,
        goal_seconds: timerTargetSeconds,
        audio_track_id: music?.id ?? null,
      };
      addReadingSession(session).catch((error) => {
        console.error(
          "Failed to save reading session on timer completion:",
          error,
        );
      });
      setTimerJustFinished(false); // Reset the flag
      setHasStarted(false);
    }
  }, [timerJustFinished, timerTargetSeconds, music]);

  useEffect(() => {
    const STORAGE_KEY = "@PagePick:reading_session_bg";

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        if (isActive) {
          const data = {
            time,
            mode,
            timerTargetSeconds,
            timestamp: Date.now(),
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } else if (nextAppState === "active") {
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
              addReadingSession(session).catch((error) =>
                console.error("Failed to save session on resume:", error),
              );
            } else {
              setTime(newTime);
            }
          }
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isActive, time, mode, timerTargetSeconds, music]);

  const handleModeChange = (newMode: Mode) => {
    if (!isActive) {
      setMode(newMode);
      setTime(newMode === "Timer" ? timerTargetSeconds : 0);
      setHasStarted(false);
    }
  };

  const handleStartPause = () => {
    if (mode === "Timer" && time === 0) return;
    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsActive((prev) => !prev);
  };

  const handleFinishReading = () => {
    if (!hasStarted) return;
    setIsActive(false); // Pause the timer/stopwatch
    setIsFinishReadingModalVisible(true); // Show the confirmation modal
  };

  const handleConfirmFinishReading = async () => {
    setIsFinishReadingModalVisible(false);

    if (hasStarted) {
      let duration_seconds = 0;
      if (mode === "Stopwatch") {
        duration_seconds = time;
      } else {
        // Timer
        duration_seconds = timerTargetSeconds - time;
      }

      // Duration should not be negative
      if (duration_seconds < 0) duration_seconds = 0;

      const session = {
        mode: mode.toLowerCase() as "timer" | "stopwatch",
        duration_seconds: duration_seconds,
        goal_seconds: mode === "Timer" ? timerTargetSeconds : null,
        audio_track_id: music?.id ?? null,
      };

      try {
        await addReadingSession(session);
      } catch (error) {
        console.error("Failed to save reading session:", error);
        // Optionally show an error to the user
      }
    }

    setTime(mode === "Timer" ? timerTargetSeconds : 0); // Reset time
    setHasStarted(false);
  };

  const handleResumeReading = () => {
    setIsFinishReadingModalVisible(false);
    setIsActive(true); // Resume timer/stopwatch
  };

  const openTimePicker = () => {
    if (mode === "Timer" && !isActive) {
      const h = Math.floor(timerTargetSeconds / 3600);
      const m = Math.floor((timerTargetSeconds % 3600) / 60);
      const s = timerTargetSeconds % 60;
      setInputHours(h.toString().padStart(2, "0"));
      setInputMinutes(m.toString().padStart(2, "0"));
      setInputSeconds(s.toString().padStart(2, "0"));
      setIsPickerVisible(true);
    }
  };

  const handleSetTime = () => {
    const hours = parseInt(inputHours, 10) || 0;
    const minutes = parseInt(inputMinutes, 10) || 0;
    const seconds = parseInt(inputSeconds, 10) || 0;
    const total = hours * 3600 + minutes * 60 + seconds;
    setTimerTargetSeconds(total);
    setTime(total);
    setIsPickerVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Time Setting Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPickerVisible}
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalCenteredView}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>시간 설정</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                maxLength={2}
                value={inputHours}
                onChangeText={setInputHours}
                selectTextOnFocus
              />
              <Text style={styles.timeInputSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                maxLength={2}
                value={inputMinutes}
                onChangeText={setInputMinutes}
                selectTextOnFocus
              />
              <Text style={styles.timeInputSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                maxLength={2}
                value={inputSeconds}
                onChangeText={setInputSeconds}
                selectTextOnFocus
              />
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsPickerVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSetButton]}
                onPress={handleSetTime}
              >
                <Text style={styles.modalButtonText}>설정</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Finish Reading Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFinishReadingModalVisible}
        onRequestClose={() => setIsFinishReadingModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>책을 다 읽으셨나요?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleResumeReading}
              >
                <Text style={styles.modalButtonText}>계속 읽기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSetButton]}
                onPress={handleConfirmFinishReading}
              >
                <Text style={styles.modalButtonText}>독서 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.logoText}>PagePick</Text>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === "Stopwatch" && styles.activeTab]}
            onPress={() => handleModeChange("Stopwatch")}
            disabled={isActive}
          >
            <Text
              style={[
                styles.tabText,
                mode === "Stopwatch" && styles.activeTabText,
              ]}
            >
              스톱워치
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === "Timer" && styles.activeTab]}
            onPress={() => handleModeChange("Timer")}
            disabled={isActive}
          >
            <Text
              style={[styles.tabText, mode === "Timer" && styles.activeTabText]}
            >
              타이머
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={openTimePicker}
          disabled={mode !== "Timer" || isActive}
        >
          <Text style={styles.timeText}>{formatTime(time)}</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={handleStartPause}
          >
            <Text style={styles.buttonText}>
              {isActive ? "일시정지" : "독서 시작"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={handleFinishReading}
          >
            <Text style={styles.buttonText}>독서 완료</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        {music && <MusicPlayer track={music} onTrackChange={setMusic} />}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => router.push("/camera")}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="camera" size={SIZES.h1} color="#007AFF" />
            </View>
            <View style={styles.btnTextContainer}>
              <Text style={styles.mainButtonTitle}>문장 수집하기</Text>
              <Text style={styles.mainButtonDesc}>
                카메라로 책을 스캔하세요
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={SIZES.h2} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: SIZES.padding * 1.5,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  logoText: {
    fontSize: SIZES.h1,
    fontWeight: "900",
    color: "#212529",
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding * 3, // Added margin to push content below
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E9ECEF",
    borderRadius: SIZES.radius * 1.5,
    padding: 4,
    marginBottom: SIZES.padding * 2,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.base * 1.5,
    borderRadius: SIZES.radius,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabText: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: "#495057",
  },
  activeTabText: {
    color: "#007AFF",
  },
  timeText: {
    fontSize: SIZES.h1 * 2,
    fontWeight: "200",
    color: "#212529",
    letterSpacing: 2,
    fontFamily: "monospace",
    marginBottom: SIZES.padding * 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius * 2,
    alignItems: "center",
    justifyContent: "center",
    width: 140,
  },
  pauseButton: {
    backgroundColor: "#007AFF",
  },
  completeButton: {
    backgroundColor: "#6C757D",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: SIZES.h4,
    fontWeight: "bold",
  },
  bottomContainer: {
    paddingBottom: SIZES.padding,
  },
  actionContainer: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    backgroundColor: "#F8F9FA",
  },
  mainButton: {
    backgroundColor: "#007AFF",
    borderRadius: SIZES.radius * 1.5,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding + SIZES.base,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  iconCircle: {
    width: SIZES.padding * 2.2,
    height: SIZES.padding * 2.2,
    borderRadius: SIZES.padding * 1.1,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.base * 2,
  },
  btnTextContainer: { flex: 1 },
  mainButtonTitle: {
    color: "white",
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.base / 2,
  },
  mainButtonDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: SIZES.body4 - 1,
  },
  // Modal Styles
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 35,
    paddingHorizontal: 25,
    width: "90%",
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: 15,
  },
  
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5, // Adjust vertical padding
    fontSize: SIZES.h2,
    lineHeight: SIZES.h2, // Set line height equal to font size for better vertical centering
    textAlign: "center",
    width: 75,
  },
  timeInputSeparator: {
    fontSize: SIZES.h2,
    marginHorizontal: 5,
  },
  
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 2,
    elevation: 2,
    flex: 1,
    marginHorizontal: SIZES.base / 2,
  },
  modalCancelButton: {
    backgroundColor: "#6C757D",
  },
  modalSetButton: {
    backgroundColor: "#007AFF",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: SIZES.h4,
  },
});



