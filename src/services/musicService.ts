
import { supabase } from "@/lib/supabase";
import { AudioTrack } from "@/types/music";

export const getAllMusic = async (): Promise<AudioTrack[]> => {
  const { data, error } = await supabase
    .from("audio_tracks")
    .select("id, title, artist, url, artwork, genre, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching music list:", error);
    return [];
  }

  return data ?? [];
};

export const getTodaysMusic = async (): Promise<AudioTrack | null> => {
  const { data, error } = await supabase
    .from("audio_tracks")
    .select("id, title, artist, url, artwork, genre, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching today's music:", error);
    return null;
  }

  return data;
};
