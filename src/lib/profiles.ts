import { User } from "firebase/auth";
import { supabase } from "./supabase";

export type DatezProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  photo_urls: string[] | null;
  bio: string | null;
  birthdate: string | null;
  location: string | null;
  gender: string | null;
  interested_in: string | null;
  relationship_goal: string | null;
  occupation: string | null;
  education: string | null;
  interests: string[] | null;
  created_at?: string;
  updated_at?: string;
};

function describeSupabaseError(error: unknown) {
  if (!error || typeof error !== "object") {
    return String(error);
  }

  const maybeError = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
    name?: string;
  };

  return JSON.stringify({
    name: maybeError.name,
    code: maybeError.code,
    message: maybeError.message,
    details: maybeError.details,
    hint: maybeError.hint
  });
}

export async function upsertProfile(user: User) {
  const existingProfile = await getProfile(user.uid);

  const { error } = existingProfile
    ? await supabase
        .from("profiles")
        .update({
          email: user.email,
          display_name: existingProfile.display_name ?? user.displayName,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.uid)
    : await supabase.from("profiles").insert(
    {
      id: user.uid,
      email: user.email,
      display_name: user.displayName,
      avatar_url: user.photoURL,
      photo_urls: [],
      updated_at: new Date().toISOString()
    }
  );

  if (error) {
    console.warn(`Unable to sync Firebase user profile to Supabase: ${describeSupabaseError(error)}`);
  }
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data as DatezProfile | null;
}

export async function getDiscoverProfiles(currentUserId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", currentUserId)
    .limit(20);

  if (error) {
    throw error;
  }

  return data as DatezProfile[];
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
    console.warn(`Unable to read profile from Supabase: ${describeSupabaseError(readError)}`);
    throw readError;
  }

  const request = existingProfile
    ? supabase.from("profiles").update(nextProfile).eq("id", profile.id).select().single()
    : supabase.from("profiles").insert(nextProfile).select().single();

  const { data, error } = await request;

  if (error) {
    console.warn(`Unable to save profile to Supabase: ${describeSupabaseError(error)}`);
    throw error;
  }

  return data as DatezProfile;
}
