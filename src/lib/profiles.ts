import { User } from "firebase/auth";
import { supabase } from "./supabase";

export async function upsertProfile(user: User) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.uid,
      email: user.email,
      display_name: user.displayName,
      avatar_url: user.photoURL,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  if (error) {
    console.warn("Unable to sync Firebase user profile to Supabase", error.message);
  }
}
