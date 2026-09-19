import * as bookService from "@/services/bookService";
import { useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { showDialog, showToast } from "@/lib/appFeedback";

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
        showDialog({
          title: "책 정보를 찾지 못했어요",
          description: "다시 스캔하거나 직접 입력할 수 있어요.",
          actions: [
            { label: "다시 스캔", onPress: () => setScanned(false) },
            {
              label: "직접 입력",
              onPress: () =>
                router.replace({
                  pathname: "/add-book",
                  params: { returnTo: params.returnTo },
                }),
            },
          ],
        });
      }
    } catch (error: any) {
      showToast(error.message || "바코드 검색에 실패했습니다.", "error");
      setScanned(false);
    }
  };

  return {
    permission,
    requestPermission,
    handleBarcodeScanned,
    router,
  };
};
