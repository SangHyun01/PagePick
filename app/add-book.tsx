import SuccessModal from "@/components/SuccessModal";
import { Colors, SIZES } from "@/constants/theme";
import { BookStatus } from "@/types/book";
import { useAddBookViewModel } from "@/view-models/useAddBookViewModel";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddBookScreen() {
  const {
    title,
    setTitle,
    author,
    setAuthor,
    coverUri,
    loading,
    isSuccess,
    router,
    status,
    setStatus,
    startedAt,
    showDatePicker,
    setShowDatePicker,
    onChangeDate,
    handleAnimationFinish,
    handleImageAction,
    handleSave,
  } = useAddBookViewModel();
  const { bottom } = useSafeAreaInsets();

  const renderStatusButton = (buttonStatus: BookStatus, label: string) => {
    const isSelected = status === buttonStatus;
    return (
      <TouchableOpacity
        style={[styles.statusButton, isSelected && styles.statusButtonSelected]}
        onPress={() => setStatus(buttonStatus)}
      >
        <Text
          style={[
            styles.statusButtonText,
            isSelected && styles.statusButtonTextSelected,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={SIZES.h2} color="#333" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            새 책 추가
          </Text>
        </View>
        <View style={{ width: SIZES.h2, paddingHorizontal: SIZES.base }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleImageAction}
        >
          {coverUri ? (
            <>
              <Image source={{ uri: coverUri }} style={styles.bookCover} />
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={SIZES.body3} color="white" />
              </View>
            </>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={SIZES.h1} color="#999" />
              <Text style={styles.placeholderText}>표지 등록</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>책 제목</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>저자</Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="저자를 입력하세요"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>책 상태</Text>
          <View style={styles.statusContainer}>
            {renderStatusButton("wish", "읽고 싶음")}
            {renderStatusButton("reading", "읽는 중")}
            {renderStatusButton("finished", "다 읽음")}
          </View>

          {status === "reading" && (
            <>
              <Text style={styles.label}>읽기 시작한 날짜</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {startedAt.toLocaleDateString()}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={SIZES.h3}
                  color={Colors.light.tint}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={startedAt}
          mode="date"
          display="spinner"
          onChange={onChangeDate}
        />
      )}

      <TouchableOpacity
        style={[
          styles.saveButton,
          { bottom: bottom + SIZES.base },
          loading && styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>책장에 꽂기</Text>
        )}
      </TouchableOpacity>

      <SuccessModal
        visible={isSuccess}
        onFinish={handleAnimationFinish}
        message="추가 완료!"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 6,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.base * 2,
    paddingHorizontal: SIZES.base * 2,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { padding: SIZES.base / 2 },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: SIZES.base,
  },
  form: { marginTop: SIZES.padding },
  label: {
    fontSize: SIZES.body3,
    fontWeight: "600",
    color: "#333",
    marginBottom: SIZES.base,
    marginTop: SIZES.base * 1.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: SIZES.radius * 0.8,
    padding: SIZES.base * 2,
    fontSize: SIZES.body3,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    position: "absolute",
    left: SIZES.padding,
    right: SIZES.padding,
    backgroundColor: Colors.light.tint,
    padding: SIZES.base * 2.2,
    borderRadius: SIZES.radius,
    alignItems: "center",
    zIndex: 1,
  },
  disabledButton: {
    backgroundColor: "#a0c8ff",
  },
  saveButtonText: { color: "white", fontSize: SIZES.h3, fontWeight: "bold" },
  imageContainer: { alignItems: "center", marginBottom: SIZES.padding * 1.25 },
  bookCover: {
    width: SIZES.width * 0.3,
    height: SIZES.width * 0.3 * 1.5,
    borderRadius: SIZES.radius * 0.6,
    backgroundColor: "#eee",
  },
  placeholder: {
    width: SIZES.width * 0.3,
    height: SIZES.width * 0.3 * 1.5,
    borderRadius: SIZES.radius * 0.6,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  placeholderText: {
    marginTop: SIZES.base,
    color: "#999",
    fontSize: SIZES.body4,
  },
  editBadge: {
    position: "absolute",
    bottom: -SIZES.base / 2,
    right: "30%",
    backgroundColor: "#333",
    padding: SIZES.base * 0.75,
    borderRadius: SIZES.radius * 1.5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: SIZES.base,
  },
  statusButton: {
    paddingVertical: SIZES.base * 1.2,
    paddingHorizontal: SIZES.base * 2,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  statusButtonSelected: {
    backgroundColor: Colors.light.tint,
  },
  statusButtonText: {
    color: Colors.light.tint,
    fontWeight: "600",
    fontSize: SIZES.body3,
  },
  statusButtonTextSelected: {
    color: "white",
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: SIZES.radius * 0.8,
    padding: SIZES.base * 2,
    backgroundColor: "#f9f9f9",
  },
  datePickerText: {
    fontSize: SIZES.body3,
    color: "#333",
  },
});
