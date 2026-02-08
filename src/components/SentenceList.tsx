import { Colors, SIZES } from "@/constants/theme";
import { Sentence } from "@/types/sentence";
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
  onOptionPress: (item: Sentence) => void;
}

export default function SentenceList({
  sentences,
  onOptionPress,
}: SentenceListProps) {
  const renderSentenceItem = ({ item }: { item: Sentence }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.quoteIcon}>
          <FontAwesome
            name="quote-left"
            size={SIZES.h2}
            color={Colors.light.tint}
            style={{ opacity: 0.3 }}
          />
        </View>
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
      </View>

      <Text style={styles.sentenceText}>{item.content}</Text>

      <View style={styles.pageContainer}>
        <Text style={styles.pageText}>p.{item.page}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={sentences}
      renderItem={renderSentenceItem}
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
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base * 2,
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
});
