import { supabase } from "@/lib/supabase";
import { Stack, useRouter, useSegments } from "expo-router";
import { useShareIntent } from "expo-share-intent";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!initialized) return; // 로딩 중이면 대기

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
  }, [session, initialized, segments, hasShareIntent, shareIntent]);

  // 로딩 화면
  if (!initialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
