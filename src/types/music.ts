export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string | null;
  genre?: string | null;
  created_at: string;
}
