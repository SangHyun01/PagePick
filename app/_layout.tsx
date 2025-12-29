import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ headerShown: false }} />
      <Stack.Screen 
        name="write" 
        options={{ 
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      {/* To be created screens */}
      {/* <Stack.Screen name="select-book" options={{ presentation: 'modal', title: '책 선택' }} /> */}
      {/* <Stack.Screen name="add-book" options={{ presentation: 'modal', title: '새 책 추가' }} /> */}
    </Stack>
  );
}
