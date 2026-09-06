import MusicPlayer from "@/components/MusicPlayer";
import { SIZES } from "@/constants/theme";
import { getTodaysMusic } from "@/services/musicService";
import { AudioTrack } from "@/types/music";
import { useHomeViewModel } from "@/view-models/useHomeViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Svg, { Circle } from "react-native-svg";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RING_SIZE = 164;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function HomeScreen() {
  const router = useRouter();
  const [music, setMusic] = useState<AudioTrack | null>(null);

  // All logic is now in the view model
  const {
    // State
    mode,
    time,
    timerTargetSeconds,
    isActive,
    // UI Values
    formattedLiveTime,
    formattedTodayTotalDuration,
    // Handlers
    handleModeChange,
    handleStartPause,
    handleConfirmFinishReading,
    handleSetTimer,
    // Modal visibility and handlers
    isFinishReadingModalVisible,
    openFinishReadingModal,
    closeFinishReadingModal,
    isPickerVisible,
    openTimePicker,
    closeTimePicker,
  } = useHomeViewModel(music);

  // Local state for time picker inputs
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

  const onSetTime = () => {
    const hours = parseInt(inputHours, 10) || 0;
    const minutes = parseInt(inputMinutes, 10) || 0;
    const seconds = parseInt(inputSeconds, 10) || 0;
    const total = hours * 3600 + minutes * 60 + seconds;
    handleSetTimer(total);
    closeTimePicker();
  };

  const onResumeReading = () => {
    closeFinishReadingModal();
    handleStartPause(); // To resume the timer
  };

  const timerProgress =
    mode === "Timer" && timerTargetSeconds > 0
      ? Math.max(0, Math.min((timerTargetSeconds - time) / timerTargetSeconds, 1))
      : 1;

  return (
    <View style={styles.container}>
      {/* Time Setting Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPickerVisible}
        onRequestClose={closeTimePicker}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalCenteredView}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalEyebrow}>독서 타이머</Text>
            <Text style={styles.modalTitle}>시간을 설정해 주세요</Text>
            <View style={styles.inputRow}>
              <View style={styles.timeInputGroup}>
                <TextInput
                  style={styles.timeInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={inputHours}
                  onChangeText={setInputHours}
                  selectTextOnFocus
                />
                <Text style={styles.timeUnit}>시간</Text>
              </View>
              <Text style={styles.timeInputSeparator}>:</Text>
              <View style={styles.timeInputGroup}>
                <TextInput
                  style={styles.timeInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={inputMinutes}
                  onChangeText={setInputMinutes}
                  selectTextOnFocus
                />
                <Text style={styles.timeUnit}>분</Text>
              </View>
              <Text style={styles.timeInputSeparator}>:</Text>
              <View style={styles.timeInputGroup}>
                <TextInput
                  style={styles.timeInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={inputSeconds}
                  onChangeText={setInputSeconds}
                  selectTextOnFocus
                />
                <Text style={styles.timeUnit}>초</Text>
              </View>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={closeTimePicker}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelButtonText]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSetButton]}
                onPress={onSetTime}
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
        onRequestClose={closeFinishReadingModal}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>책을 다 읽으셨나요?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={onResumeReading}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelButtonText]}>
                  계속 읽기
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSetButton]}
                onPress={() => {
                  closeFinishReadingModal();
                  handleConfirmFinishReading();
                }}
              >
                <Text style={styles.modalButtonText}>독서 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.fixedContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>PagePick</Text>
          </View>
          <View style={styles.dailyReadingBadge}>
            <Ionicons name="book-outline" size={SIZES.h4} color="#557A68" />
            <Text style={styles.dailyReadingText}>{formattedTodayTotalDuration}</Text>
          </View>
        </View>

        <View style={styles.timerContainer}>
        <View style={styles.readingCard}>
          <View style={styles.cardHeading}>
            <View>
              <Text style={styles.cardEyebrow}>독서 시간</Text>
            </View>
          </View>

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
            style={styles.timerRing}
            onPress={openTimePicker}
            disabled={mode !== "Timer" || isActive}
            activeOpacity={mode === "Timer" && !isActive ? 0.7 : 1}
          >
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="#E8EFEA"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={mode === "Timer" ? "#375A4E" : "#557A68"}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - timerProgress)}
                fill="none"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.ringContent}>
              <Text style={styles.timeText}>{formattedLiveTime}</Text>
              <Text style={styles.ringLabel}>
                {mode === "Timer" ? "남은 시간" : "경과 시간"}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.pauseButton]}
              onPress={handleStartPause}
            >
              <Ionicons name={isActive ? "pause" : "play"} size={SIZES.h4} color="#fff" />
              <Text style={styles.buttonText}>{isActive ? "일시정지" : "독서 시작"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={openFinishReadingModal}
            >
              <Ionicons name="checkmark" size={SIZES.h4} color="#375A4E" />
              <Text style={styles.completeButtonText}>독서 완료</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => router.push("/camera")}
              activeOpacity={0.8}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="camera" size={SIZES.h1} color="#375A4E" />
              </View>
              <View style={styles.btnTextContainer}>
                <Text style={styles.mainButtonTitle}>문장 수집하기</Text>
                <Text style={styles.mainButtonDesc}>
                  카메라로 책을 스캔하세요
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={SIZES.h2} color="#557A68" />
            </TouchableOpacity>
          </View>
          {music && (
            <View style={styles.musicSection}>
              <MusicPlayer track={music} onTrackChange={setMusic} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5F0",
    paddingTop: SIZES.padding * 1.5,
  },
  fixedContent: {
    flex: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  logoText: {
    fontSize: SIZES.h1 + 2,
    fontWeight: "700",
    color: "#24332D",
  },
  dailyReadingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.base / 2,
    backgroundColor: "#E8EFEA",
    borderRadius: SIZES.radius * 2,
    paddingHorizontal: SIZES.base * 1.5,
    paddingVertical: SIZES.base,
  },
  dailyReadingText: {
    fontSize: SIZES.body4 - 1,
    color: "#375A4E",
    fontWeight: "600",
  },
  timerContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  readingCard: {
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius * 2,
    padding: SIZES.padding * 0.8,
    borderWidth: 1,
    borderColor: "#ECE8DF",
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  cardHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.base,
  },
  cardEyebrow: {
    color: "#8A998F",
    fontSize: SIZES.body4 - 2,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F2ED",
    borderRadius: SIZES.radius,
    padding: 4,
    marginBottom: SIZES.base,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.base * 1.5,
    borderRadius: SIZES.radius,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FFFDFC",
  },
  tabText: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: "#78857E",
  },
  activeTabText: {
    color: "#375A4E",
  },
  timerRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.base * 1.5,
  },
  ringSvg: { position: "absolute" },
  ringContent: { alignItems: "center", justifyContent: "center" },
  timeText: {
    fontSize: SIZES.h1 * 0.9,
    fontWeight: "500",
    color: "#24332D",
    letterSpacing: -0.5,
    fontFamily: "monospace",
  },
  ringLabel: {
    color: "#78857E",
    fontSize: SIZES.body4 - 3,
    marginTop: SIZES.base / 3,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SIZES.base,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    gap: SIZES.base,
    paddingVertical: SIZES.base * 1.5,
    borderRadius: SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseButton: {
    backgroundColor: "#375A4E",
  },
  completeButton: {
    backgroundColor: "#EEF2ED",
    borderWidth: 1,
    borderColor: "#D8E1D9",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: SIZES.h4,
    fontWeight: "bold",
  },
  completeButtonText: { color: "#375A4E", fontSize: SIZES.h4, fontWeight: "bold" },
  bottomContainer: {
    paddingBottom: SIZES.base,
  },
  actionContainer: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.base,
    backgroundColor: "#F7F5F0",
  },
  musicSection: { marginTop: SIZES.padding },
  mainButton: {
    backgroundColor: "#FFFDFC",
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: "#E4E1D8",
    paddingVertical: SIZES.padding * 0.9,
    paddingHorizontal: SIZES.padding + SIZES.base,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#3A493F",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: SIZES.padding * 2.2,
    height: SIZES.padding * 2.2,
    borderRadius: SIZES.padding * 1.1,
    backgroundColor: "#E8EFEA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.base * 2,
  },
  btnTextContainer: { flex: 1 },
  mainButtonTitle: {
    color: "#24332D",
    fontSize: SIZES.h3,
    fontWeight: "bold",
    marginBottom: SIZES.base / 2,
  },
  mainButtonDesc: {
    color: "#78857E",
    fontSize: SIZES.body4 - 1,
  },
  // Modal Styles
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(36, 51, 45, 0.38)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#FFFEFA",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E1E7DF",
    paddingVertical: 30,
    paddingHorizontal: 24,
    width: "90%",
  },
  modalEyebrow: {
    color: "#6C8778",
    fontSize: SIZES.body4 - 2,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: SIZES.base,
    textAlign: "center",
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: "#24332D",
    marginBottom: 22,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "center",
  },
  timeInputGroup: {
    alignItems: "center",
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#D9E4DA",
    backgroundColor: "#F2F6F1",
    borderRadius: 14,
    paddingHorizontal: SIZES.padding * 0.7,
    paddingVertical: SIZES.padding * 0.45,
    fontSize: SIZES.h2 - 2,
    lineHeight: SIZES.h2 - 2,
    color: "#375A4E",
    fontWeight: "700",
    textAlign: "center",
    width: 64,
  },
  timeUnit: {
    color: "#87958C",
    fontSize: SIZES.body4 - 3,
    marginTop: SIZES.base,
  },
  timeInputSeparator: {
    color: "#94A49A",
    fontSize: SIZES.h2 - 4,
    fontWeight: "700",
    marginHorizontal: 6,
    marginBottom: SIZES.base * 2,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: SIZES.padding * 0.55,
    flex: 1,
    marginHorizontal: SIZES.base / 2,
  },
  modalCancelButton: {
    backgroundColor: "#F1F4F0",
    borderWidth: 1,
    borderColor: "#E0E7DF",
  },
  modalSetButton: {
    backgroundColor: "#375A4E",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: SIZES.h4,
  },
  modalCancelButtonText: {
    color: "#64736A",
  },
});
