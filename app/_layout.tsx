import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* index.tsx를 메인 화면으로 설정 */}
      <Stack.Screen name="index" options={{ title: "PagePick" }} />
    </Stack>
  );
}
