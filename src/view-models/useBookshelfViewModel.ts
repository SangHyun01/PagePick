import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { fetchBooks } from "../services/bookService";
import { Book } from "../types/book";

export const useBookshelfViewModel = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchBooks();
      setBooks(data);
    } catch (e) {
      console.error("불러오기 실패", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks]),
  );

  return { books, isLoading, loadBooks };
};
