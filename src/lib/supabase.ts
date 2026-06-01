import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseUrl = rawSupabaseUrl ? new URL(rawSupabaseUrl).origin : undefined;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Add them to .env before using data features.");
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
