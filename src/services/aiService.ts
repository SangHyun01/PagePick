import { supabase } from "@/lib/supabase";

/**AI 맞춤법 교정
 * DB와 통신
 */
export const correctSpelling = async (text: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("ai-fix-text", {
    body: { text },
  });

  if (error) {
    throw new Error(`AI correction failed: ${error.message}`);
  }

  if (!data?.fixedText) {
    throw new Error("AI function did not return corrected text.");
  }

  return data.fixedText;
};
