import { ExpoConfig } from "@expo/config";
import "dotenv/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  extra: {
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    naverClientId: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID,
    naverClientSecret: process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET,
  },
});
