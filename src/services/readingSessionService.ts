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

export const getTodayReadingDuration = async (userId: string): Promise<number> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("reading_sessions")
    .select("duration_seconds")
    .eq("user_id", userId)
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString());

  if (error) {
    console.error("Error fetching today's reading duration:", error);
    return 0;
  }

  if (!data) {
    return 0;
  }

  const totalDuration = data.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0
  );

  return totalDuration;
};
