export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  streak: number;
  streak_freezes: number;
  last_reward_date: string;
  last_read_date: string;
  updated_at: string;
  username: string;
  avatar_url: string;
  quote_count: number;
  book_count: number;
}
