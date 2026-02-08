import { Colors, SIZES } from "@/constants/theme";
import { usePhotoDetailViewModel } from "@/view-models/usePhotoDetailViewModel";
import { Ionicons } from "@expo/vector-icons";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function PhotoDetailScreen() {
  const params = useLocalSearchParams();

  const photoUrl = params.photo_url as string;
  const bookTitle = params.bookTitle as string;
  const bookAuthor = params.bookAuthor as string;

  const [imageHeight, setImageHeight] = useState(0);

  const {
    isMenuVisible,
    animatedStyle,
    openMenu,
    closeMenu,
    handleDelete,
    handleDownload,
    handleShare,
  } = usePhotoDetailViewModel({ photoUrl });

  useEffect(() => {
    if (photoUrl) {
      Image.getSize(
        photoUrl,
        (width, height) => {
          const ratio = height / width;
          setImageHeight(screenWidth * ratio);
        },
        (error) => console.error("이미지 크기 계산 실패:", error),
      );
    }
  }, [photoUrl]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, animation: "fade" }} />

      <SafeAreaView style={{ backgroundColor: "white" }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={30} color="black" />
          </TouchableOpacity>

          <View style={styles.infoRow}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {bookTitle}
              </Text>
              <Text style={styles.author} numberOfLines={1}>
                {bookAuthor}
              </Text>
            </View>

            <TouchableOpacity
              onPress={openMenu}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={styles.optionButton}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.imageArea}>
        {imageHeight > 0 ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <ReactNativeZoomableView
              maxZoom={3}
              minZoom={1}
              zoomStep={0.5}
              initialZoom={1}
              bindToBorders={true}
              contentWidth={screenWidth}
              contentHeight={imageHeight}
              style={styles.zoomContainer}
            >
              <Image
                source={{ uri: photoUrl }}
                style={{ width: screenWidth, height: imageHeight }}
                resizeMode="contain"
              />
            </ReactNativeZoomableView>
          </ScrollView>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </View>

      <Modal
        animationType="none"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.menuContainer, animatedStyle]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDownload}
              >
                <Ionicons
                  name="download-outline"
                  size={22}
                  color={Colors.light.text}
                />
                <Text style={styles.menuText}>다운로드</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
                <Ionicons
                  name="share-outline"
                  size={22}
                  color={Colors.light.text}
                />
                <Text style={styles.menuText}>공유</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color={"red"} />
                <Text style={[styles.menuText, { color: "red" }]}>삭제</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: SIZES.base * 2.5,
    paddingTop: Platform.OS === "android" ? SIZES.base * 2.5 : SIZES.base * 2,
    alignItems: "flex-start",
    backgroundColor: "white",
  },
  closeButton: { marginLeft: -SIZES.base / 2 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.base,
  },
  textContainer: {
    flex: 1,
  },
  optionButton: { marginTop: SIZES.base * 2 },
  title: {
    marginTop: SIZES.base * 2.5,
    marginLeft: SIZES.base,
    color: "#333",
    fontSize: SIZES.h4 * 0.9,
    fontWeight: "bold",
  },
  author: {
    marginLeft: SIZES.base,
    color: "#666",
    fontSize: SIZES.h3 * 0.8,
    marginTop: SIZES.base / 4,
  },

  imageArea: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "flex-start",
  },

  zoomContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.padding / 1.5,
  },
  menuText: {
    fontSize: SIZES.h3,
    marginLeft: SIZES.padding,
    color: Colors.light.text,
  },
  cancelItem: {
    marginTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    justifyContent: "center",
  },
});
