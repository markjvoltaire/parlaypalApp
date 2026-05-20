import { Platform } from "react-native";

export const REVENUECAT_API_KEY =
  (Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY) ??
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
