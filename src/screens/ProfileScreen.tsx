import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { DatezProfile, getProfile, saveProfile } from "../lib/profiles";

type ProfileForm = {
  displayName: string;
  location: string;
  birthdate: string;
  bio: string;
};

const emptyForm: ProfileForm = {
  displayName: "",
  location: "",
  birthdate: "",
  bio: ""
};

export function ProfileScreen() {
  const { user } = useAuth();
  const [form, setForm] = React.useState<ProfileForm>(emptyForm);
  const [profile, setProfile] = React.useState<DatezProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMessage(null);
        const savedProfile = await getProfile(user.uid);

        if (!mounted) {
          return;
        }

        setProfile(savedProfile);
        setForm({
          displayName: savedProfile?.display_name ?? user.displayName ?? "",
          location: savedProfile?.location ?? "",
          birthdate: savedProfile?.birthdate ?? "",
          bio: savedProfile?.bio ?? ""
        });
      } catch (error) {
        if (mounted) {
          setForm({
            ...emptyForm,
            displayName: user.displayName ?? ""
          });
          setMessage("Profile data is not available yet. Check your Supabase profile policies.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!user) {
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const savedProfile = await saveProfile({
        id: user.uid,
        email: user.email,
        avatar_url: user.photoURL,
        display_name: form.displayName.trim() || user.displayName || "Datez Member",
        location: form.location.trim() || null,
        birthdate: form.birthdate.trim() || null,
        bio: form.bio.trim() || null
      });

      setProfile(savedProfile);
      setMessage("Profile saved.");
    } catch (error) {
      setMessage("Could not save profile. Confirm the profiles table and policies in Supabase.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#E94163" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Your Datez card</Text>
            <Text style={styles.title}>Profile</Text>
          </View>
          <View style={styles.completionBadge}>
            <Ionicons name="sparkles" size={17} color="#E94163" />
            <Text style={styles.completionText}>{profile?.bio ? "Live" : "Draft"}</Text>
          </View>
        </View>

        <View style={styles.identity}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={44} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.identityText}>
            <Text style={styles.name}>{form.displayName || user?.displayName || "Datez Member"}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Display name</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={(value) => updateField("displayName", value)}
              placeholder="What should matches call you?"
              placeholderTextColor="#A6939A"
              style={styles.input}
              value={form.displayName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={(value) => updateField("location", value)}
              placeholder="City, country"
              placeholderTextColor="#A6939A"
              style={styles.input}
              value={form.location}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Birthdate</Text>
            <TextInput
              inputMode="numeric"
              onChangeText={(value) => updateField("birthdate", value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A6939A"
              style={styles.input}
              value={form.birthdate}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              multiline
              onChangeText={(value) => updateField("bio", value)}
              placeholder="A warm little intro for your future matches."
              placeholderTextColor="#A6939A"
              style={[styles.input, styles.bioInput]}
              textAlignVertical="top"
              value={form.bio}
            />
          </View>
        </View>

        {message ? <Text style={message === "Profile saved." ? styles.successMessage : styles.errorMessage}>{message}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={handleSave}
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed, saving && styles.saveButtonDisabled]}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="checkmark" size={22} color="#FFFFFF" />}
          <Text style={styles.saveButtonText}>{saving ? "Saving" : "Save profile"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8FA",
    flex: 1
  },
  centered: {
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    paddingTop: 62
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24
  },
  eyebrow: {
    color: "#E94163",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: "#241C21",
    fontSize: 34,
    fontWeight: "800"
  },
  completionBadge: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  completionText: {
    color: "#6F5962",
    fontSize: 13,
    fontWeight: "800"
  },
  identity: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    marginBottom: 22,
    padding: 16
  },
  avatar: {
    borderRadius: 42,
    height: 84,
    width: 84
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#E94163",
    borderRadius: 42,
    height: 84,
    justifyContent: "center",
    width: 84
  },
  identityText: {
    flex: 1,
    gap: 5
  },
  name: {
    color: "#241C21",
    fontSize: 22,
    fontWeight: "800"
  },
  email: {
    color: "#6F5962",
    fontSize: 14
  },
  form: {
    gap: 16
  },
  field: {
    gap: 8
  },
  label: {
    color: "#352A30",
    fontSize: 14,
    fontWeight: "800"
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 16,
    borderWidth: 1,
    color: "#241C21",
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  bioInput: {
    lineHeight: 23,
    minHeight: 132
  },
  successMessage: {
    color: "#2F855A",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 16
  },
  errorMessage: {
    color: "#B83254",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 16
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#E94163",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    height: 58,
    justifyContent: "center",
    marginTop: 22
  },
  saveButtonPressed: {
    transform: [{ scale: 0.99 }]
  },
  saveButtonDisabled: {
    opacity: 0.72
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  }
});
