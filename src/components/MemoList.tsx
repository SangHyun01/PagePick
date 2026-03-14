import { Colors, SIZES } from "@/constants/theme";
import { Memo } from "@/types/memo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MemoListProps {
  memos: Memo[];
  onOptionPress: (memo: Memo) => void;
}

const MemoList: React.FC<MemoListProps> = ({ memos, onOptionPress }) => {
  const renderItem = ({ item }: { item: Memo }) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.memoIcon}>
          <MaterialIcons
            name="notes"
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

      <Text style={styles.memoText}>{item.content}</Text>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.page && (
          <View style={styles.pageContainer}>
            <Text style={styles.pageText}>p.{item.page}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      data={memos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 저장된 메모가 없습니다.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SIZES.padding * 0.3,
    paddingTop: SIZES.padding,
    paddingBottom: 100, // FAB 크기만큼 하단 여백 추가
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
  memoIcon: { marginBottom: SIZES.base },
  memoText: {
    fontSize: SIZES.body3,
    lineHeight: SIZES.h2,
    color: Colors.light.text,
    fontWeight: "500",
    letterSpacing: -0.5,
    marginBottom: SIZES.base * 1.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: SIZES.base,
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  pageContainer: {
    alignItems: "flex-end",
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
  emptyContainer: {
    alignItems: "center",
    marginTop: SIZES.largeTitle,
  },
  emptyText: {
    color: Colors.light.icon,
    fontSize: SIZES.body4,
  },
});

export default MemoList;
