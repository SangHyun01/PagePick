import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// 임시 책 데이터 타입
interface Book {
  id: string;
  title: string;
  coverUri: string;
}

export default function BookshelfScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]); // 초기에는 책이 없는 상태

  const handleAddBook = () => {
    Alert.alert(
      "새 책 추가",
      "어떤 방법으로 추가하시겠어요?",
      [
        {
          text: "바코드 검색",
          onPress: () => {
            // TODO: 바코드 스캐너 화면으로 이동
            console.log("바코드 검색 선택");
          },
        },
        {
          text: "직접 추가",
          onPress: () => {
            // TODO: 새 책 추가 화면으로 이동
            router.push('/add-book');
          },
        },
        {
          text: "취소",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>책장이 비어있어요.</Text>
      <Text style={styles.emptySubText}>아래 버튼을 눌러 첫 책을 추가해보세요.</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
        <Ionicons name="add" size={60} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity style={styles.bookItem}>
      {/* <Image source={{ uri: item.coverUri }} style={styles.bookCover} /> */}
      <View style={styles.bookCoverPlaceholder} />
      <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>책장</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContentContainer: {
    flexGrow: 1,
    padding: 10,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  // Book Item Styles
  bookItem: {
    flex: 1,
    margin: 10,
    alignItems: 'center',
  },
  bookCoverPlaceholder: {
    width: 150,
    height: 220,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});