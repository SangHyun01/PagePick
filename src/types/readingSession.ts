export interface ReadingSession {
  id?: string;
  user_id: string;
  mode: "timer" | "stopwatch";
  duration_seconds: number;
  goal_seconds?: number | null;
  audio_track_id?: string | null;
  created_at?: string;
}
