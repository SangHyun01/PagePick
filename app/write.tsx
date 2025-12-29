import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function WriteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (params.text) {
      // 배열로 들어올 경우를 대비해 문자열로 변환
      const incomingText = Array.isArray(params.text) ? params.text[0] : params.text;
      setContent(incomingText);
    }
  }, [params.text]);

  const handleSave = () => {
    Alert.alert("저장 완료!", "문장이 보관함에 저장되었습니다.");
    router.dismissAll(); // 또는 router.push('/')
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문장 다듬기 ✏️</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="여기에 문장이 들어옵니다."
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>보관함에 저장</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { fontSize: 16, color: '#007AFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  inputContainer: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 15, padding: 20, marginBottom: 20 },
  textInput: { fontSize: 16, lineHeight: 24, color: '#333', flex: 1 },
  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});