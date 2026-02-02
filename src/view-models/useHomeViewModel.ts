import * as sentenceService from "@/services/sentenceService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

// 기본 문장
const DEFAULT_QUOTE = {
  content: "책은 얼어붙은 감수성을 깨는 도끼여야 한다.",
  source: "프란츠 카프카",
  page: null,
  author: null,
};

export const useHomeViewModel = () => {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRandomSentence();
    }, []),
  );

  const fetchRandomSentence = async () => {
    setLoading(true);
    try {
      const randomQuote = await sentenceService.getRandomSentence();
      setQuote(randomQuote || DEFAULT_QUOTE);
    } catch (e) {
      console.error(e);
      setQuote(DEFAULT_QUOTE);
    } finally {
      setLoading(false);
    }
  };

  return {
    quote,
    loading,
    isDefaultQuote: quote === DEFAULT_QUOTE,
  };
};
