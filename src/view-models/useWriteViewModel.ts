import { correctSpelling } from "@/services/aiService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useWriteViewModel = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [content, setContent] = useState<string>("");
  const [page, setPage] = useState<string>("");
  const [isFixing, setIsFixing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (params.text) {
      const incomingText = Array.isArray(params.text)
        ? params.text[0]
        : params.text;
      setContent(incomingText);
    }
  }, [params.text]);

  const handleAiFix = async () => {
    if (!content.trim()) {
      Alert.alert("알림", "교정할 문장이 없습니다.");
      return;
    }

    setIsFixing(true);
    try {
      const fixedText = await correctSpelling(content);
      setContent(fixedText);
      Alert.alert("완료", "문장의 맞춤법과 띄어쓰기가 교정되었어요!");
    } catch (e: any) {
      console.error(e);
      Alert.alert("오류", "맞춤법 교정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsFixing(false);
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const navigateToNext = (pathname: "/select-book" | "/add-book") => {
    if (!page || !content) {
      Alert.alert("알림", "페이지와 문장을 모두 입력해주세요.");
      return;
    }
    router.push({
      pathname: pathname as any,
      params: { content, page, tags: JSON.stringify(selectedTags) },
    });
  };

  return {
    content,
    setContent,
    page,
    setPage,
    isFixing,
    selectedTags,
    handleAiFix,
    handleTagSelect,
    navigateToNext,
    router,
  };
};
