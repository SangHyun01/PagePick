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
    .select(
      "id, nickname, streak_freezes, created_at, last_reward_date, last_read_date, streak, frozen_dates, updated_at", // Updated to match user's schema
    )
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
};

const getDaysBetween = (dateString1: string, dateString2: string) => {
  const d1 = new Date(dateString1);
  const d2 = new Date(dateString2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// 로컬(한국) 기준 YYYY-MM-DD 포맷을 뽑아주는 헬퍼 함수
const getLocalDateString = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 연속 기록 업데이트 (징검다리 로직)
export const updateUserStreak = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("streak, last_read_date, streak_freezes, frozen_dates") // Select frozen_dates
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("사용자 프로필을 찾을 수 없습니다.");
  }

  const todayString = getLocalDateString(new Date());

  const { streak, last_read_date, streak_freezes, frozen_dates } = profile; // Destructure frozen_dates

  if (last_read_date === todayString) {
    // 이미 오늘 기록했으면 아무것도 안함
    return;
  }

  let newStreak = streak || 0;
  let newFreezes = streak_freezes || 0;
  const newLastReadDate = todayString;
  let newFrozenDates = frozen_dates || [];

  if (last_read_date) {
    const daysDifference = getDaysBetween(last_read_date, todayString);

    if (daysDifference === 1) {
      // 연속 달성
      newStreak += 1;
    } else if (daysDifference > 1) {
      // 연속이 끊김
      const freezesNeeded = daysDifference - 1;
      if (streak_freezes >= freezesNeeded) {
        // 보호권으로 연속 유지
        newFreezes -= freezesNeeded;
        newStreak += 1;

        let currentFrozenDate = new Date(last_read_date);
        currentFrozenDate.setDate(currentFrozenDate.getDate() + 1);

        for (let i = 0; i < freezesNeeded; i++) {
          newFrozenDates.push(getLocalDateString(currentFrozenDate));
          currentFrozenDate.setDate(currentFrozenDate.getDate() + 1);
        }
      } else {
        // 보호권 부족, 연속 기록 리셋
        newStreak = 1; // 오늘부터 다시 1일
        newFrozenDates = [];
      }
    }
  } else {
    // 첫 기록
    newStreak = 1;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      streak: newStreak,
      last_read_date: newLastReadDate,
      streak_freezes: newFreezes,
      frozen_dates: newFrozenDates,
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error("연속 기록 업데이트에 실패했습니다.");
  }
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

const getUserReadingDates = async (userId: string): Promise<string[]> => {
  const { data: sentences, error } = await supabase
    .from("sentences")
    .select("create_at")
    .eq("user_id", userId)
    .order("create_at", { ascending: false });

  if (error) {
    console.error(
      "Error fetching user sentences for streak recalculation:",
      error,
    );
    return [];
  }

  const uniqueDates = new Set<string>();
  sentences.forEach((s) => {
    uniqueDates.add(getLocalDateString(s.create_at));
  });

  return Array.from(uniqueDates).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );
};

// 연속 기록 및 마지막 독서일 재계산
export const recalculateStreakAndLastReadDate = async (userId: string) => {
  const readingDates = await getUserReadingDates(userId);

  let newLastReadDate: string | null = null;
  let newStreak = 0;

  if (readingDates.length > 0) {
    newLastReadDate = readingDates[0];

    let currentCheckDate = new Date(newLastReadDate);
    currentCheckDate.setHours(0, 0, 0, 0);

    let streakCount = 0;
    const readingDatesSet = new Set(readingDates);

    while (true) {
      const dateStr = getLocalDateString(currentCheckDate);
      if (readingDatesSet.has(dateStr)) {
        streakCount++;
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
      } else {
        break;
      }
    }
    newStreak = streakCount;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      streak: newStreak,
      last_read_date: newLastReadDate,
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error("연속 기록 및 마지막 독서일 재계산에 실패했습니다.");
  }
};
