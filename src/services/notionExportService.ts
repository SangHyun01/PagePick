import { supabase } from "@/lib/supabase";

export type NotionExportResult = {
  url: string;
  exported: {
    books: number;
    sentences: number;
    memos: number;
  };
};

export const exportReadingArchiveToNotion = async (): Promise<NotionExportResult> => {
  const { data, error } = await supabase.functions.invoke<NotionExportResult>(
    "notion-export-test",
    { method: "POST" },
  );

  if (error) {
    const response = error.context;
    const errorBody =
      response instanceof Response
        ? await response.json().catch(() => null)
        : null;
    const message =
      errorBody &&
      typeof errorBody === "object" &&
      "error" in errorBody &&
      typeof errorBody.error === "string"
        ? errorBody.error
        : "노션 내보내기를 완료하지 못했습니다. 설정을 확인해 주세요.";
    throw new Error(message);
  }

  if (!data?.url) {
    throw new Error("노션에서 생성된 아카이브를 찾지 못했습니다.");
  }

  return data;
};
