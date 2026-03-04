export interface AuthCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  streak: number;
  max_streak: number;
  streak_freezes: number;
  created_at: string;
  last_reward_date: string;
  last_read_date: string;
  updated_at: string;
  frozen_dates: string[];
}
