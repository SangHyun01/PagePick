import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { fetchBooks } from "../services/bookService";
import { Book, BookStatus } from "../types/book";

export const useBookshelfViewModel = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | "all">(
    "all",
  );

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

  const handleStatusChange = (status: BookStatus | "all") => {
    setSelectedStatus(status);
  };

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        if (selectedStatus === "all") return true;
        return book.status === selectedStatus;
      })
      .filter((book) => {
        const query = searchQuery.toLowerCase();
        return (
          book.title.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query)
        );
      });
  }, [books, selectedStatus, searchQuery]);

  return {
    books,
    isLoading,
    loadBooks,
    filteredBooks,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    handleStatusChange,
  };
};
