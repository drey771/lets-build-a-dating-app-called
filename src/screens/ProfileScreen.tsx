import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { uploadProfilePhoto } from "../lib/profilePhotos";
import { DatezProfile, getProfile, saveProfile } from "../lib/profiles";

type ProfileForm = {
  displayName: string;
  avatarUrl: string;
  photoUrls: string[];
  location: string;
  birthdate: string;
  bio: string;
  gender: string;
  interestedIn: string;
  relationshipGoal: string;
  occupation: string;
  education: string;
  interests: string[];
};

const emptyForm: ProfileForm = {
  displayName: "",
  avatarUrl: "",
  photoUrls: [],
  location: "",
  birthdate: "",
  bio: "",
  gender: "",
  interestedIn: "",
  relationshipGoal: "",
  occupation: "",
  education: "",
  interests: []
};

const genderOptions = ["Woman", "Man", "Non-binary"];
const interestedInOptions = ["Women", "Men", "Everyone"];
const goalOptions = ["Long-term", "Short-term", "New friends", "Still figuring it out"];
const interestOptions = ["Music", "Travel", "Fitness", "Food", "Movies", "Faith", "Tech", "Books", "Art", "Dancing"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const maxGalleryPhotos = 5;

function describeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    return JSON.stringify(error);
  }

  return String(error);
}

function calculateCompletion(form: ProfileForm) {
  const fields = [
    form.displayName,
    form.avatarUrl,
    form.photoUrls.length ? "photos" : "",
    form.location,
    form.birthdate,
    form.bio,
    form.gender,
    form.interestedIn,
    form.relationshipGoal,
    form.occupation,
    form.education,
    form.interests.length ? "interests" : ""
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function calculateAge(birthdate: string) {
  if (!birthdate) {
    return null;
  }

  const parsedDate = new Date(birthdate);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > parsedDate.getMonth() ||
    (today.getMonth() === parsedDate.getMonth() && today.getDate() >= parsedDate.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age > 0 ? age : null;
}

function formatDateForSupabase(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateFromValue(value: string) {
  const parsedDate = value ? new Date(value) : null;

  if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  const fallbackDate = new Date();
  fallbackDate.setFullYear(fallbackDate.getFullYear() - 25);

  return fallbackDate;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function ProfileScreen() {
  const { user } = useAuth();
  const [form, setForm] = React.useState<ProfileForm>(emptyForm);
  const [profile, setProfile] = React.useState<DatezProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = React.useState(false);
  const [draftBirthdate, setDraftBirthdate] = React.useState(() => getDateFromValue(""));

  const completion = calculateCompletion(form);
  const age = calculateAge(form.birthdate);

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
          avatarUrl: savedProfile?.avatar_url ?? user.photoURL ?? "",
          photoUrls: savedProfile?.photo_urls ?? [],
          location: savedProfile?.location ?? "",
          birthdate: savedProfile?.birthdate ?? "",
          bio: savedProfile?.bio ?? "",
          gender: savedProfile?.gender ?? "",
          interestedIn: savedProfile?.interested_in ?? "",
          relationshipGoal: savedProfile?.relationship_goal ?? "",
          occupation: savedProfile?.occupation ?? "",
          education: savedProfile?.education ?? "",
          interests: savedProfile?.interests ?? []
        });
      } catch (error) {
        if (mounted) {
          setForm({
            ...emptyForm,
            avatarUrl: user.photoURL ?? "",
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

  function updateField(field: keyof Omit<ProfileForm, "interests" | "photoUrls">, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleInterest(interest: string) {
    setForm((current) => {
      const exists = current.interests.includes(interest);

      return {
        ...current,
        interests: exists
          ? current.interests.filter((currentInterest) => currentInterest !== interest)
          : [...current.interests, interest]
      };
    });
  }

  function openDatePicker() {
    setDraftBirthdate(getDateFromValue(form.birthdate));
    setDatePickerVisible(true);
  }

  function updateDraftDate(part: "year" | "month" | "day", direction: 1 | -1) {
    setDraftBirthdate((currentDate) => {
      const nextDate = new Date(currentDate);

      if (part === "year") {
        nextDate.setFullYear(nextDate.getFullYear() + direction);
      }

      if (part === "month") {
        nextDate.setMonth(nextDate.getMonth() + direction);
      }

      if (part === "day") {
        nextDate.setDate(nextDate.getDate() + direction);
      }

      const daysInMonth = getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth());

      if (nextDate.getDate() > daysInMonth) {
        nextDate.setDate(daysInMonth);
      }

      return nextDate;
    });
  }

  function confirmBirthdate() {
    updateField("birthdate", formatDateForSupabase(draftBirthdate));
    setDatePickerVisible(false);
  }

  async function pickImage(allowsEditing: boolean) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setMessage("Photo access is needed to add profile pictures.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing,
      aspect: allowsEditing ? [1, 1] : undefined,
      quality: 0.82
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0] ?? null;
  }

  async function handleAvatarPick() {
    if (!user) {
      return;
    }

    try {
      setUploadingPhoto(true);
      setMessage(null);
      const asset = await pickImage(true);

      if (!asset) {
        return;
      }

      const publicUrl = await uploadProfilePhoto(user.uid, asset, "avatar");
      updateField("avatarUrl", publicUrl);
      setMessage("Profile picture added. Save profile to keep it.");
    } catch (error) {
      console.warn(`Profile photo upload failed: ${describeError(error)}`);
      setMessage("Could not upload profile picture. Confirm the Supabase storage bucket and policies.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleGalleryPhotoPick() {
    if (!user || form.photoUrls.length >= maxGalleryPhotos) {
      return;
    }

    try {
      setUploadingPhoto(true);
      setMessage(null);
      const asset = await pickImage(false);

      if (!asset) {
        return;
      }

      const publicUrl = await uploadProfilePhoto(user.uid, asset, "gallery");
      setForm((current) => ({
        ...current,
        photoUrls: [...current.photoUrls, publicUrl].slice(0, maxGalleryPhotos)
      }));
      setMessage("Photo added. Save profile to keep it.");
    } catch (error) {
      console.warn(`Gallery photo upload failed: ${describeError(error)}`);
      setMessage("Could not upload photo. Confirm the Supabase storage bucket and policies.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function removeGalleryPhoto(photoUrl: string) {
    setForm((current) => ({
      ...current,
      photoUrls: current.photoUrls.filter((currentPhotoUrl) => currentPhotoUrl !== photoUrl)
    }));
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
        avatar_url: form.avatarUrl || user.photoURL,
        photo_urls: form.photoUrls,
        display_name: form.displayName.trim() || user.displayName || "Datez Member",
        location: form.location.trim() || null,
        birthdate: form.birthdate.trim() || null,
        bio: form.bio.trim() || null,
        gender: form.gender || null,
        interested_in: form.interestedIn || null,
        relationship_goal: form.relationshipGoal || null,
        occupation: form.occupation.trim() || null,
        education: form.education.trim() || null,
        interests: form.interests
      });

      setProfile(savedProfile);
      setMessage("Profile saved.");
    } catch (error) {
      console.warn(`Profile save failed: ${describeError(error)}`);
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
            <Text style={styles.completionValue}>{completion}%</Text>
            <Text style={styles.completionText}>Ready</Text>
          </View>
        </View>

        <View style={styles.preview}>
          <View style={styles.previewMedia}>
            {form.avatarUrl ? (
              <Image source={{ uri: form.avatarUrl }} style={styles.previewAvatar} />
            ) : (
              <View style={styles.previewAvatarFallback}>
                <Ionicons name="person" size={52} color="#FFFFFF" />
              </View>
            )}
            <Pressable accessibilityRole="button" disabled={uploadingPhoto} onPress={handleAvatarPick} style={styles.photoAction}>
              {uploadingPhoto ? <ActivityIndicator color="#E94163" size="small" /> : <Ionicons name="camera" size={16} color="#E94163" />}
            </Pressable>
          </View>

          <View style={styles.previewBody}>
            <Text style={styles.previewName}>
              {form.displayName || user?.displayName || "Datez Member"}
              {age ? `, ${age}` : ""}
            </Text>
            <View style={styles.previewMetaRow}>
              <Ionicons name="location" size={15} color="#6F5962" />
              <Text style={styles.previewMeta}>{form.location || "Add your city"}</Text>
            </View>
            <Text style={styles.previewBio} numberOfLines={3}>
              {form.bio || "Write a warm intro so matches can feel your energy before the first hello."}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completion}%` }]} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#E94163" />
            <Text style={styles.sectionTitle}>Basics</Text>
          </View>

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

          <View style={styles.fieldGrid}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Birthdate</Text>
              <Pressable accessibilityRole="button" onPress={openDatePicker} style={styles.dateButton}>
                <Text style={[styles.dateButtonText, !form.birthdate && styles.dateButtonPlaceholder]}>
                  {form.birthdate || "Pick date"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#E94163" />
              </Pressable>
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updateField("location", value)}
                placeholder="City"
                placeholderTextColor="#A6939A"
                style={styles.input}
                value={form.location}
              />
            </View>
          </View>

          <ChipGroup label="Gender" options={genderOptions} selected={form.gender} onSelect={(value) => updateField("gender", value)} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color="#E94163" />
            <Text style={styles.sectionTitle}>Dating Style</Text>
          </View>

          <ChipGroup
            label="Interested in"
            options={interestedInOptions}
            selected={form.interestedIn}
            onSelect={(value) => updateField("interestedIn", value)}
          />

          <ChipGroup
            label="Looking for"
            options={goalOptions}
            selected={form.relationshipGoal}
            onSelect={(value) => updateField("relationshipGoal", value)}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={20} color="#E94163" />
            <Text style={styles.sectionTitle}>About You</Text>
          </View>

          <View style={styles.fieldGrid}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Work</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updateField("occupation", value)}
                placeholder="Designer"
                placeholderTextColor="#A6939A"
                style={styles.input}
                value={form.occupation}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Education</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => updateField("education", value)}
                placeholder="University"
                placeholderTextColor="#A6939A"
                style={styles.input}
                value={form.education}
              />
            </View>
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

          <View style={styles.field}>
            <Text style={styles.label}>Interests</Text>
            <View style={styles.chipWrap}>
              {interestOptions.map((interest) => {
                const selected = form.interests.includes(interest);

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{interest}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images-outline" size={20} color="#E94163" />
            <Text style={styles.sectionTitle}>Photos</Text>
          </View>

          <View style={styles.galleryGrid}>
            {form.photoUrls.map((photoUrl, index) => (
              <View key={photoUrl} style={styles.galleryTile}>
                <Image source={{ uri: photoUrl }} style={styles.galleryImage} />
                <Pressable accessibilityRole="button" onPress={() => removeGalleryPhoto(photoUrl)} style={styles.removePhotoButton}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.photoNumber}>{index + 1}</Text>
              </View>
            ))}

            {form.photoUrls.length < maxGalleryPhotos ? (
              <Pressable
                accessibilityRole="button"
                disabled={uploadingPhoto}
                onPress={handleGalleryPhotoPick}
                style={[styles.galleryTile, styles.addPhotoTile, uploadingPhoto && styles.uploadingTile]}
              >
                {uploadingPhoto ? <ActivityIndicator color="#E94163" /> : <Ionicons name="add" size={28} color="#E94163" />}
                <Text style={styles.addPhotoText}>{form.photoUrls.length}/{maxGalleryPhotos}</Text>
              </Pressable>
            ) : null}
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

      <Modal animationType="fade" transparent visible={datePickerVisible} onRequestClose={() => setDatePickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerPanel}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Birthdate</Text>
              <Pressable accessibilityRole="button" onPress={() => setDatePickerVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#352A30" />
              </Pressable>
            </View>

            <View style={styles.datePickerColumns}>
              <DateStepper
                label="Month"
                value={monthNames[draftBirthdate.getMonth()] ?? ""}
                onDecrease={() => updateDraftDate("month", -1)}
                onIncrease={() => updateDraftDate("month", 1)}
              />
              <DateStepper
                label="Day"
                value={String(draftBirthdate.getDate())}
                onDecrease={() => updateDraftDate("day", -1)}
                onIncrease={() => updateDraftDate("day", 1)}
              />
              <DateStepper
                label="Year"
                value={String(draftBirthdate.getFullYear())}
                onDecrease={() => updateDraftDate("year", -1)}
                onIncrease={() => updateDraftDate("year", 1)}
              />
            </View>

            <Pressable accessibilityRole="button" onPress={confirmBirthdate} style={styles.confirmDateButton}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.confirmDateText}>Use date</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

type ChipGroupProps = {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

function ChipGroup({ label, options, selected, onSelect }: ChipGroupProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipWrap}>
        {options.map((option) => {
          const active = selected === option;

          return (
            <Pressable
              accessibilityRole="button"
              key={option}
              onPress={() => onSelect(active ? "" : option)}
              style={[styles.chip, active && styles.chipSelected]}
            >
              <Text style={[styles.chipText, active && styles.chipTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type DateStepperProps = {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
};

function DateStepper({ label, value, onDecrease, onIncrease }: DateStepperProps) {
  return (
    <View style={styles.dateStepper}>
      <Text style={styles.dateStepperLabel}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={onIncrease} style={styles.stepperButton}>
        <Ionicons name="chevron-up" size={22} color="#E94163" />
      </Pressable>
      <Text style={styles.dateStepperValue}>{value}</Text>
      <Pressable accessibilityRole="button" onPress={onDecrease} style={styles.stepperButton}>
        <Ionicons name="chevron-down" size={22} color="#E94163" />
      </Pressable>
    </View>
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
    marginBottom: 20
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
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  completionValue: {
    color: "#E94163",
    fontSize: 17,
    fontWeight: "900"
  },
  completionText: {
    color: "#6F5962",
    fontSize: 12,
    fontWeight: "800"
  },
  preview: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
    padding: 16
  },
  previewMedia: {
    height: 104,
    width: 104
  },
  previewAvatar: {
    borderRadius: 20,
    height: 104,
    width: 104
  },
  previewAvatarFallback: {
    alignItems: "center",
    backgroundColor: "#E94163",
    borderRadius: 20,
    height: 104,
    justifyContent: "center",
    width: 104
  },
  photoAction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 16,
    borderWidth: 1,
    bottom: -7,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: -7,
    width: 32
  },
  previewBody: {
    flex: 1,
    justifyContent: "center"
  },
  previewName: {
    color: "#241C21",
    fontSize: 23,
    fontWeight: "900"
  },
  previewMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 6
  },
  previewMeta: {
    color: "#6F5962",
    flex: 1,
    fontSize: 14,
    fontWeight: "700"
  },
  previewBio: {
    color: "#55454D",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10
  },
  progressTrack: {
    backgroundColor: "#F0DCE2",
    borderRadius: 999,
    height: 8,
    marginBottom: 18,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: "#E94163",
    borderRadius: 999,
    height: 8
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    marginBottom: 16,
    padding: 16
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  sectionTitle: {
    color: "#241C21",
    fontSize: 18,
    fontWeight: "900"
  },
  field: {
    gap: 8
  },
  fieldGrid: {
    flexDirection: "row",
    gap: 12
  },
  fieldHalf: {
    flex: 1,
    gap: 8
  },
  label: {
    color: "#352A30",
    fontSize: 14,
    fontWeight: "800"
  },
  input: {
    backgroundColor: "#FFF8FA",
    borderColor: "#F0DCE2",
    borderRadius: 14,
    borderWidth: 1,
    color: "#241C21",
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  dateButton: {
    alignItems: "center",
    backgroundColor: "#FFF8FA",
    borderColor: "#F0DCE2",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 14
  },
  dateButtonText: {
    color: "#241C21",
    flex: 1,
    fontSize: 16,
    fontWeight: "700"
  },
  dateButtonPlaceholder: {
    color: "#A6939A",
    fontWeight: "500"
  },
  bioInput: {
    lineHeight: 23,
    minHeight: 126
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    backgroundColor: "#FFF8FA",
    borderColor: "#F0DCE2",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9
  },
  chipSelected: {
    backgroundColor: "#E94163",
    borderColor: "#E94163"
  },
  chipText: {
    color: "#55454D",
    fontSize: 14,
    fontWeight: "800"
  },
  chipTextSelected: {
    color: "#FFFFFF"
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  galleryTile: {
    aspectRatio: 1,
    backgroundColor: "#FFF8FA",
    borderColor: "#F0DCE2",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    width: "30%"
  },
  galleryImage: {
    height: "100%",
    width: "100%"
  },
  addPhotoTile: {
    alignItems: "center",
    borderStyle: "dashed",
    justifyContent: "center",
    overflow: "visible"
  },
  uploadingTile: {
    opacity: 0.72
  },
  addPhotoText: {
    color: "#6F5962",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4
  },
  removePhotoButton: {
    alignItems: "center",
    backgroundColor: "rgba(36, 28, 33, 0.72)",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: 6,
    top: 6,
    width: 28
  },
  photoNumber: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    bottom: 6,
    color: "#241C21",
    fontSize: 12,
    fontWeight: "900",
    left: 6,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 3,
    position: "absolute"
  },
  successMessage: {
    color: "#2F855A",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2
  },
  errorMessage: {
    color: "#B83254",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 2
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#E94163",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    height: 58,
    justifyContent: "center",
    marginTop: 10
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
  },
  modalOverlay: {
    backgroundColor: "rgba(36, 28, 33, 0.38)",
    flex: 1,
    justifyContent: "flex-end"
  },
  datePickerPanel: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30
  },
  datePickerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18
  },
  datePickerTitle: {
    color: "#241C21",
    fontSize: 22,
    fontWeight: "900"
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "#FFF8FA",
    borderRadius: 16,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  datePickerColumns: {
    flexDirection: "row",
    gap: 10
  },
  dateStepper: {
    alignItems: "center",
    backgroundColor: "#FFF8FA",
    borderColor: "#F0DCE2",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12
  },
  dateStepperLabel: {
    color: "#6F5962",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase"
  },
  stepperButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 42
  },
  dateStepperValue: {
    color: "#241C21",
    fontSize: 20,
    fontWeight: "900",
    marginVertical: 2
  },
  confirmDateButton: {
    alignItems: "center",
    backgroundColor: "#E94163",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    height: 56,
    justifyContent: "center",
    marginTop: 18
  },
  confirmDateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900"
  }
});
