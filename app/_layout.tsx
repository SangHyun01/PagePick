import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useShareIntent } from "expo-share-intent";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    registerForPushNotificationsAsync();

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setInitialized(true);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [fontsLoaded]);

  useEffect(() => {
    if (!initialized || !fontsLoaded) return; // 로딩 중이면 대기

    const inAuthGroup = segments[0] === "auth";

    // 로그인이 안 되어 있으면 로그인 화면으로
    if (!session) {
      if (!inAuthGroup) {
        router.replace("/auth");
      }
      return;
    }

    // 로그인 됨 + 공유된 파일이 있음 책 선택 화면으로
    if (
      hasShareIntent &&
      (shareIntent.type === "media" || shareIntent.type === "file") &&
      shareIntent.files
    ) {
      const sharedFile = shareIntent.files?.[0];

      if (sharedFile) {
        router.replace({
          pathname: "/select-book",
          params: {
            sharedImageUri: sharedFile.path,
            isShareMode: "true",
          },
        });

        resetShareIntent();
        return;
      }
    }

    // 로그인 됨 + 공유 없음 + 현재 로그인 화면임 -> 홈으로
    if (inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [
    session,
    initialized,
    fontsLoaded,
    segments,
    hasShareIntent,
    shareIntent,
    resetShareIntent,
    router,
  ]);

  // 로딩 화면
  if (!initialized || !fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style="dark" />
        <Stack>
          {/* 로그인/회원가입 화면 등록 */}
          <Stack.Screen name="auth" options={{ headerShown: false }} />

          {/* 메인 탭 화면 */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* 카메라 화면 */}
          <Stack.Screen name="camera" options={{ headerShown: false }} />

          {/* 글쓰기 화면 (모달) */}
          <Stack.Screen
            name="write"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />

          {/* 책 추가 관련 화면들 */}
          <Stack.Screen name="add-book" options={{ headerShown: false }} />
          <Stack.Screen name="scan-barcode" options={{ headerShown: false }} />
          <Stack.Screen name="select-book" options={{ headerShown: false }} />

          {/* 책 상세 화면 */}
          <Stack.Screen name="book-detail/[id]" options={{ headerShown: false }} />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
