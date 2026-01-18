import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddBookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // 검색된 데이터를 받음

  // 입력 필드 상태
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUri, setCoverUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [isbn, setIsbn] = useState("");

  // 화면이 켜질 때, 넘어온 파라미터가 있으면 자동으로 채워넣기
  useEffect(() => {
    if (params.title)
      setTitle(Array.isArray(params.title) ? params.title[0] : params.title);
    if (params.author)
      setAuthor(
        Array.isArray(params.author) ? params.author[0] : params.author,
      );
    if (params.image)
      setCoverUri(Array.isArray(params.image) ? params.image[0] : params.image);
    if (params.isbn)
      setIsbn(Array.isArray(params.isbn) ? params.isbn[0] : params.isbn);
  }, [params]);

  // 표지 이미지 추가 (카메라 or 갤러리)
  const handleImageAction = () => {
    Alert.alert("표지 이미지 등록", "어떤 이미지를 사용하시겠어요?", [
      {
        text: "갤러리에서 선택",
        onPress: pickImageFromLibrary,
      },
      {
        text: "카메라 촬영",
        onPress: pickImageFromCamera,
      },
      { text: "취소", style: "cancel" },
    ]);
  };

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverUri(result.assets[0].uri);
    }
  };

  // 카메라 열기
  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("알림", "카메라 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setCoverUri(result.assets[0].uri);
    }
  };

  // 이미지 supabase store에 업로드
  const uploadImage = async (uri: string) => {
    if (uri.startsWith("http")) return uri;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // 파일명 랜덤 생성
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.jpg`;

      const { error } = await supabase.storage
        .from("covers")
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
        });

      if (error) throw error;

      // 업로드 된 이미지의 공개 URL 받아오기
      const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e) {
      console.error("이미지 업로드 실패", e);
      throw new Error("이미지 업로드에 실패했습니다.");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("알림", "책 제목을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 중복 체크
      if (isbn && isbn.length > 0) {
        const { data: isbnCheck } = await supabase
          .from("books")
          .select("id, title")
          .eq("isbn", isbn)
          .maybeSingle();
        if (isbnCheck) {
          Alert.alert("알림", "이미 등록된 책입니다. (ISBN)");
          setLoading(false);
          return;
        }
      }

      const { data: titleCheck } = await supabase
        .from("books")
        .select("id, title")
        .eq("title", title.trim())
        .eq("author", author.trim())
        .maybeSingle();

      if (titleCheck) {
        Alert.alert("알림", "이미 등록된 책입니다.");
        setLoading(false);
        return;
      }

      // 이미지 업로드 처리
      let finalCoverUrl = coverUri;
      if (coverUri && !coverUri.startsWith("http")) {
        // 로컬 파일인 경우에만 업로드 진행
        finalCoverUrl = await uploadImage(coverUri);
      }

      // DB 저장
      const { error } = await supabase
        .from("books")
        .insert([
          {
            title: title.trim(),
            author: author.trim(),
            cover_url: finalCoverUrl, // 업로드된 주소 저장
            isbn: isbn,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert("완료", "책장에 책이 추가되었습니다!", [
        {
          text: "확인",
          onPress: () => {
            if (params.returnTo === "select-book") {
              router.back();
            } else {
              router.dismissAll();
              router.replace("/(tabs)/bookshelf");
            }
          },
        },
      ]);
    } catch (e: any) {
      console.error(e);
      Alert.alert("오류", e.message || "문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            새 책 추가
          </Text>
        </View>

        <View style={{ width: 28, paddingHorizontal: 10 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 표지 이미지 미리보기 */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleImageAction}
        >
          {coverUri ? (
            <>
              <Image source={{ uri: coverUri }} style={styles.bookCover} />
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={40} color="#999" />
              <Text style={styles.placeholderText}>표지 등록</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 입력 폼 */}
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

      {/*하단 저장 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>책장에 꽂기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: { padding: 4 },

  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },

  coverContainer: { alignItems: "center", marginBottom: 30 },
  coverImage: { width: 120, height: 174, borderRadius: 5 },
  emptyCover: {
    width: 120,
    height: 174,
    backgroundColor: "#eee",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCoverText: { color: "#999" },

  form: { gap: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#eee" },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  saveButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  imageContainer: { alignItems: "center", marginBottom: 30 },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  placeholder: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  placeholderText: { marginTop: 8, color: "#999", fontSize: 14 },
  editBadge: {
    position: "absolute",
    bottom: -5,
    right: "30%",
    backgroundColor: "#333",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
