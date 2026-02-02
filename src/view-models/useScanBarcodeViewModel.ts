import * as bookService from "@/services/bookService";
import { useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export const useScanBarcodeViewModel = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const book = await bookService.searchBookByIsbn(data);
      if (book) {
        router.replace({
          pathname: "/add-book",
          params: {
            title: book.title,
            author: book.author,
            image: book.image,
            isbn: data,
            returnTo: params.returnTo,
          },
        });
      } else {
        Alert.alert(
          "알림",
          "정보를 찾을 수 없는 책입니다.\n직접 입력하시겠습니까?",
          [
            { text: "다시 스캔", onPress: () => setScanned(false) },
            {
              text: "직접 입력",
              onPress: () =>
                router.replace({
                  pathname: "/add-book",
                  params: { returnTo: params.returnTo },
                }),
            },
          ],
        );
      }
    } catch (error: any) {
      Alert.alert("오류", error.message, [
        { text: "확인", onPress: () => setScanned(false) },
      ]);
    }
  };

  return {
    permission,
    requestPermission,
    handleBarcodeScanned,
    router,
  };
};
