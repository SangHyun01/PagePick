import SuccessModal from "@/components/SuccessModal";
import { SIZES } from "@/constants/theme";
import { useAddBookViewModel } from "@/view-models/useAddBookViewModel";
import { Ionicons } from "@expo/vector-icons";
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
    handleAnimationFinish,
    handleImageAction,
    handleSave,
  } = useAddBookViewModel();

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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>책장에 꽂기</Text>
          )}
        </TouchableOpacity>
      </View>

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
  scrollContent: { padding: SIZES.padding },
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
  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: SIZES.base * 2.2,
    borderRadius: SIZES.radius,
    alignItems: "center",
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
});
