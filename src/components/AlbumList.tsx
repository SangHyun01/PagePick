import { Colors, SIZES } from "@/constants/theme";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LoadingModal from "./LoadingModal";

const NUM_COLUMNS = 3;
const ITEM_SPACING = 2;
const totalSpacing = (NUM_COLUMNS - 1) * ITEM_SPACING;
const contentWidth = SIZES.width - totalSpacing;
const itemWidth = contentWidth / NUM_COLUMNS;

interface Photo {
  id: number;
  photo_url: string;
}

interface AlbumListProps {
  photos: Photo[];
  onAddPress: () => void;
  isLoading: boolean;
  // onPhotoPress: (photo: Photo) => void;
}

const AlbumList: React.FC<AlbumListProps> = ({
  photos,
  onAddPress,
  isLoading,
  // onPhotoPress,
}) => {
  return (
    <View style={styles.container}>
      <LoadingModal visible={isLoading} message="사진 추가 중" />
      <FlatList
        data={photos}
        keyExtractor={(item) =>
          item.id ? item.id.toString() : Math.random().toString()
        }
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.imageContainer}
            activeOpacity={0.9}
            // onPress={() => onPhotoPress(item)}
          >
            <Image source={{ uri: item.photo_url }} style={styles.albumImage} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyListText}>등록된 사진이 없습니다.</Text>
          </View>
        }
      />
      <View style={styles.uploadButtonContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={onAddPress}>
          <Text style={styles.uploadButtonText}>사진 추가하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  imageContainer: {
    width: itemWidth,
    aspectRatio: 1,
    marginBottom: ITEM_SPACING,
  },
  albumImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: SIZES.base,
  },
  uploadButtonContainer: {
    padding: SIZES.padding,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  uploadButton: {
    backgroundColor: Colors.light.tint,
    padding: SIZES.padding / 1.5,
    borderRadius: SIZES.radius,
    alignItems: "center",
  },
  uploadButtonText: {
    color: Colors.light.background,
    fontSize: SIZES.h3,
    fontWeight: "bold",
  },
  emptyListText: {
    color: Colors.light.icon,
  },
});

export default AlbumList;
