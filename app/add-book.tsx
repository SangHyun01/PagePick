import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
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

  // 화면이 켜질 때, 넘어온 파라미터가 있으면 자동으로 채워넣기
  useEffect(() => {
    if (params.title)
      setTitle(Array.isArray(params.title) ? params.title[0] : params.title);
    if (params.author)
      setAuthor(
        Array.isArray(params.author) ? params.author[0] : params.author
      );
    if (params.image)
      setCoverUri(Array.isArray(params.image) ? params.image[0] : params.image);
  }, [params]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("알림", "책 제목을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("books").insert([
        {
          title: title,
          author: author,
          cover_url: coverUri,
        },
      ]);

      if (error) {
        throw error;
      }

      Alert.alert("완료", "서버 책장에 안전하게 저장되었습니다! ☁️", [
        {
          text: "확인",
          onPress: () => {
            router.dismissAll();
            router.replace("/(tabs)/bookshelf");
          },
        },
      ]);
    } catch (e: any) {
      console.error(e);
      Alert.alert("오류 발생", e.message || JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>새 책 추가 📚</Text>

        {/* 표지 이미지 미리보기 */}
        <View style={styles.coverContainer}>
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.coverImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.emptyCover}>
              <Text style={styles.emptyCoverText}>표지 없음</Text>
            </View>
          )}
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <Text style={styles.label}>책 제목</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
          />

          <Text style={styles.label}>저자</Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="저자를 입력하세요"
          />
        </View>
      </ScrollView>

      {/* 하단 저장 버튼 */}
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
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 30,
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
});
