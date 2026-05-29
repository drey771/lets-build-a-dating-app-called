import { User } from "firebase/auth";
import { supabase } from "./supabase";

export type DatezProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  birthdate: string | null;
  location: string | null;
  created_at?: string;
  updated_at?: string;
};

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

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data as DatezProfile | null;
}

export async function saveProfile(profile: Pick<DatezProfile, "id"> & Partial<DatezProfile>) {
  const nextProfile = {
    ...profile,
    updated_at: new Date().toISOString()
  };

  const { data: existingProfile, error: readError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profile.id)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const request = existingProfile
    ? supabase.from("profiles").update(nextProfile).eq("id", profile.id).select().single()
    : supabase.from("profiles").insert(nextProfile).select().single();

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return data as DatezProfile;
}
