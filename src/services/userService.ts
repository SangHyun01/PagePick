import { supabase } from "@/lib/supabase";
import { AuthCredentials, UserProfile } from "@/types/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// 로그인
export const signIn = async (credentials: AuthCredentials) => {
  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
};

// 회원가입
export const signUp = async (credentials: AuthCredentials) => {
  const { error } = await supabase.auth.signUp(credentials);
  if (error) throw error;
};

// 유저 정보 불러오기
export const getUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// 유저 프로필 정보 불러오기
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
};

// 연속 달성 보상 지급
export const grantStreakReward = async (
  userId: string,
  newFreezeCount: number,
  today: string,
) => {
  const { error } = await supabase
    .from("profiles")
    .update({ streak_freezes: newFreezeCount, last_reward_date: today })
    .eq("id", userId);
  if (error) throw error;
};

// 로그아웃
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  await GoogleSignin.signOut();
  if (error) throw error;
};

// 계정 삭제
export const deleteAccount = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("User is not authenticated.");

  const { error } = await supabase.functions.invoke("delete-account", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) throw error;

  await signOut();
};
