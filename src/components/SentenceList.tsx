import { Colors, SIZES } from "@/constants/theme";
import { Sentence } from "@/types/sentence";
import { fontScale } from "@/utils/responsive";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SentenceListProps {
  sentences: Sentence[];
  onOptionPress?: (item: Sentence) => void;
  isBottomSheet?: boolean;
}

export default function SentenceList({
  sentences,
  onOptionPress,
  isBottomSheet = false,
}: SentenceListProps) {
  const renderSentenceItem = (item: Sentence) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.quoteIcon}>
          <FontAwesome
            name="quote-left"
            size={SIZES.h2}
            color={Colors.light.tint}
            style={{ opacity: 0.3 }}
          />
        </View>
        {onOptionPress && (
          <TouchableOpacity
            onPress={() => onOptionPress(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={SIZES.h2}
              color={Colors.light.icon}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sentenceText}>{item.content}</Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagList}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.pageContainer}>
        <Text style={styles.pageText}>p.{item.page}</Text>
      </View>
    </View>
  );

  // 바텀시트 내부라면 부모(BottomSheetScrollView)에 스크롤을 맡기고 일반 View로 렌더링
  if (isBottomSheet) {
    return (
      <View style={styles.container}>
        {sentences.length > 0 ? (
          sentences.map((item) => renderSentenceItem(item))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 저장된 문장이 없습니다.</Text>
          </View>
        )}
      </View>
    );
  }

  // 일반 화면이라면 자체적으로 FlatList를 사용하여 스크롤 가능하게 함
  return (
    <FlatList
      data={sentences}
      renderItem={({ item }) => renderSentenceItem(item)}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 저장된 문장이 없습니다.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.base,
  },
  listContent: {
    paddingHorizontal: SIZES.padding * 0.3,
    paddingVertical: SIZES.padding,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base * 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.base,
  },
  quoteIcon: { marginBottom: SIZES.base },
  sentenceText: {
    fontSize: SIZES.body3,
    lineHeight: SIZES.h2,
    color: Colors.light.text,
    fontWeight: "500",
    letterSpacing: -0.5,
    marginBottom: SIZES.base * 1.5,
  },
  pageContainer: {
    alignItems: "flex-end",
    marginTop: SIZES.base * 1.5,
  },
  pageText: {
    fontSize: SIZES.h4,
    color: Colors.light.icon,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
    overflow: "hidden",
  },
  emptyContainer: { alignItems: "center", marginTop: SIZES.largeTitle },
  emptyText: { color: Colors.light.icon, fontSize: SIZES.body4 },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.base,
    marginTop: SIZES.base,
  },
  tag: {
    backgroundColor: "white",
    borderColor: Colors.light.tint,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base,
  },
  tagText: {
    fontSize: fontScale(10),
    color: Colors.light.tint,
    fontWeight: "600",
  },
});
