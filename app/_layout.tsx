import { supabase } from "@/lib/supabase";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 앱 켜자마자 로그인 상태 확인
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setInitialized(true);
    };

    checkSession();

    // 로그인/로그아웃 상태가 변하면 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // 로그인 여부에 따라 화면 이동
    const inAuthGroup = segments[0] === "auth"; // auth 화면에 있는지 확인

    if (session && inAuthGroup) {
      router.replace("/(tabs)/bookshelf");
    } else if (!session && !inAuthGroup) {
      router.replace("/auth");
    }
  }, [session, initialized, segments]);

  // 로그인 체크 중일 때 로딩 표시
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
