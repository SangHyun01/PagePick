import { Ionicons } from "@expo/vector-icons";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function PhotoDetailScreen() {
  const params = useLocalSearchParams();

  const photoUrl = params.photo_url as string;
  const bookTitle = params.bookTitle as string;
  const bookAuthor = params.bookAuthor as string;

  const [imageHeight, setImageHeight] = useState(0);

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
          <View>
            <Text style={styles.title} numberOfLines={1}>
              {bookTitle}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {bookAuthor}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.imageArea}>
        {imageHeight > 0 ? (
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
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 20 : 15,
    alignItems: "flex-start",
    backgroundColor: "white",
    paddingBottom: 10,
  },
  closeButton: { marginLeft: -5 },

  title: {
    marginTop: 20,
    marginLeft: 8,
    color: "#333",
    fontSize: 13,
    fontWeight: "bold",
  },
  author: {
    marginLeft: 8,
    color: "#666",
    fontSize: 11,
    marginTop: 2,
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
});
