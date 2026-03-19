import { supabase } from "../lib/supabase";
import { ReadingSession } from "../types/readingSession";
import { getUser } from "./userService";

type InsertReadingSession = Omit<ReadingSession, "id" | "created_at" | "user_id">;

export const addReadingSession = async (
  session: InsertReadingSession
): Promise<void> => {
  const user = await getUser();
  if (!user) {
    // Not throwing an error here, just logging and returning
    // because the user might be using the timer without being logged in.
    console.log("User not authenticated. Skipping reading session save.");
    return;
  }

  const sessionData: Omit<ReadingSession, "id" | "created_at"> = {
    ...session,
    user_id: user.id,
  };

  const { error } = await supabase.from("reading_sessions").insert([sessionData]);
  if (error) {
    console.error("Error adding reading session:", error);
    throw error;
  }
};
