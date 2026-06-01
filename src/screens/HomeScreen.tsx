import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { DatezProfile, getDiscoverProfiles } from "../lib/profiles";

type DiscoverProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  photo_urls: string[] | null;
  bio: string | null;
  birthdate: string | null;
  location: string | null;
  relationship_goal: string | null;
  occupation: string | null;
  education: string | null;
  interests: string[] | null;
};

const fallbackProfiles: DiscoverProfile[] = [
  {
    id: "amara-demo",
    display_name: "Amara",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    photo_urls: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80"
    ],
    bio: "Coffee walks, live music, and Sunday market dates.",
    birthdate: "1998-04-12",
    location: "Lagos",
    relationship_goal: "Long-term",
    occupation: "Product designer",
    education: "Unilag",
    interests: ["Music", "Food", "Art"]
  },
  {
    id: "nora-demo",
    display_name: "Nora",
    avatar_url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80",
    photo_urls: [
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80"
    ],
    bio: "Soft life, bookshops, and trying every new restaurant once.",
    birthdate: "1996-08-22",
    location: "Abuja",
    relationship_goal: "Still figuring it out",
    occupation: "Brand strategist",
    education: "Baze University",
    interests: ["Books", "Travel", "Movies"]
  },
  {
    id: "tomi-demo",
    display_name: "Tomi",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    photo_urls: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80"
    ],
    bio: "Gym before work, jazz after dinner, peace always.",
    birthdate: "1993-11-03",
    location: "Lekki",
    relationship_goal: "Long-term",
    occupation: "Software engineer",
    education: "Covenant University",
    interests: ["Fitness", "Tech", "Music"]
  }
];

function calculateAge(birthdate: string | null) {
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

function getProfilePhotos(profile: DiscoverProfile) {
  return [profile.avatar_url, ...(profile.photo_urls ?? [])].filter(Boolean) as string[];
}

function normalizeProfile(profile: DatezProfile): DiscoverProfile {
  return {
    id: profile.id,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    photo_urls: profile.photo_urls,
    bio: profile.bio,
    birthdate: profile.birthdate,
    location: profile.location,
    relationship_goal: profile.relationship_goal,
    occupation: profile.occupation,
    education: profile.education,
    interests: profile.interests
  };
}

export function HomeScreen() {
  const { user } = useAuth();
  const [safeMeetupOnly, setSafeMeetupOnly] = React.useState(true);
  const [profiles, setProfiles] = React.useState<DiscoverProfile[]>(fallbackProfiles);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [notice, setNotice] = React.useState<string | null>(null);

  const currentProfile = profiles[currentIndex];
  const profilePhotos = currentProfile ? getProfilePhotos(currentProfile) : [];
  const activePhoto = profilePhotos[photoIndex] ?? profilePhotos[0];
  const age = currentProfile ? calculateAge(currentProfile.birthdate) : null;

  React.useEffect(() => {
    let mounted = true;

    async function loadProfiles() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const discoverProfiles = await getDiscoverProfiles(user.uid);

        if (!mounted) {
          return;
        }

        setProfiles(discoverProfiles.length ? discoverProfiles.map(normalizeProfile) : fallbackProfiles);
        setCurrentIndex(0);
        setPhotoIndex(0);
      } catch (error) {
        console.warn("Unable to load discover profiles", error);
        if (mounted) {
          setProfiles(fallbackProfiles);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfiles();

    return () => {
      mounted = false;
    };
  }, [user]);

  function moveToNextProfile(message: string) {
    setNotice(message);
    setPhotoIndex(0);
    setCurrentIndex((index) => (index + 1) % profiles.length);
  }

  function changePhoto(direction: 1 | -1) {
    if (!profilePhotos.length) {
      return;
    }

    setPhotoIndex((index) => {
      const nextIndex = index + direction;

      if (nextIndex < 0) {
        return profilePhotos.length - 1;
      }

      if (nextIndex >= profilePhotos.length) {
        return 0;
      }

      return nextIndex;
    });
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#E94163" />
      </View>
    );
  }

  if (!currentProfile || !activePhoto) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="heart-circle" size={54} color="#E94163" />
        <Text style={styles.emptyTitle}>No profiles yet</Text>
        <Text style={styles.emptyText}>When more Datez members complete their profiles, they will appear here.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Discover</Text>
          <Text style={styles.title}>Datez</Text>
        </View>
        <Pressable accessibilityLabel="Filter matches" style={styles.iconButton}>
          <Ionicons name="options" size={22} color="#241C21" />
        </Pressable>
      </View>

      <View style={styles.safetyBar}>
        <View style={styles.safetyIcon}>
          <Ionicons name="shield-checkmark" size={20} color="#E94163" />
        </View>
        <View style={styles.safetyCopy}>
          <Text style={styles.safetyTitle}>Public meetup mode</Text>
          <Text style={styles.safetyText}>
            {safeMeetupOnly ? "Prioritize matches open to safe public first dates." : "Show all compatible profiles."}
          </Text>
        </View>
        <Switch
          onValueChange={setSafeMeetupOnly}
          thumbColor="#FFFFFF"
          trackColor={{ false: "#D8CBD0", true: "#E94163" }}
          value={safeMeetupOnly}
        />
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <ImageBackground source={{ uri: activePhoto }} imageStyle={styles.cardImage} style={styles.card}>
        <View style={styles.photoControls}>
          <Pressable accessibilityLabel="Previous photo" onPress={() => changePhoto(-1)} style={styles.photoTapZone}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </Pressable>
          <Pressable accessibilityLabel="Next photo" onPress={() => changePhoto(1)} style={styles.photoTapZone}>
            <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.photoDots}>
          {profilePhotos.map((photoUrl, index) => (
            <View key={photoUrl} style={[styles.photoDot, index === photoIndex && styles.photoDotActive]} />
          ))}
        </View>

        <View style={styles.cardOverlay}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {currentProfile.display_name ?? "Datez Member"}
              {age ? `, ${age}` : ""}
            </Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location" size={16} color="#FFF5F7" />
            <Text style={styles.metaText}>{currentProfile.location ?? "Nearby"}</Text>
          </View>

          <Text style={styles.bio}>{currentProfile.bio ?? "Still writing something thoughtful."}</Text>

          <View style={styles.detailRow}>
            {currentProfile.relationship_goal ? <InfoPill icon="heart" label={currentProfile.relationship_goal} /> : null}
            {currentProfile.occupation ? <InfoPill icon="briefcase" label={currentProfile.occupation} /> : null}
            {currentProfile.education ? <InfoPill icon="school" label={currentProfile.education} /> : null}
          </View>
        </View>
      </ImageBackground>

      <View style={styles.interestsSection}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.chipWrap}>
          {(currentProfile.interests?.length ? currentProfile.interests : ["Good conversation", "Kindness"]).map((interest) => (
            <View key={interest} style={styles.chip}>
              <Text style={styles.chipText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Pass"
          onPress={() => moveToNextProfile("Passed. Showing another profile.")}
          style={[styles.actionButton, styles.secondaryAction]}
        >
          <Ionicons name="close" size={30} color="#6F5962" />
        </Pressable>
        <Pressable
          accessibilityLabel="Like"
          onPress={() => moveToNextProfile("Liked. We will show a match here when they like you back.")}
          style={[styles.actionButton, styles.primaryAction]}
        >
          <Ionicons name="heart" size={34} color="#FFFFFF" />
        </Pressable>
        <Pressable
          accessibilityLabel="Send message"
          onPress={() => setNotice("Message prompt coming soon. For now, use like to show interest.")}
          style={[styles.actionButton, styles.secondaryAction]}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#6F5962" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

type InfoPillProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function InfoPill({ icon, label }: InfoPillProps) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon} size={14} color="#FFFFFF" />
      <Text style={styles.infoPillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8FA",
    flex: 1
  },
  content: {
    padding: 20,
    paddingBottom: 34,
    paddingTop: 62
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
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
    fontWeight: "900"
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  safetyBar: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    padding: 14
  },
  safetyIcon: {
    alignItems: "center",
    backgroundColor: "#FFF0F4",
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  safetyCopy: {
    flex: 1
  },
  safetyTitle: {
    color: "#241C21",
    fontSize: 15,
    fontWeight: "900"
  },
  safetyText: {
    color: "#6F5962",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 2
  },
  notice: {
    color: "#6F5962",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10
  },
  card: {
    aspectRatio: 0.74,
    borderRadius: 28,
    justifyContent: "flex-end",
    minHeight: 470,
    overflow: "hidden"
  },
  cardImage: {
    borderRadius: 28
  },
  photoControls: {
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  photoTapZone: {
    justifyContent: "center",
    opacity: 0.74,
    paddingHorizontal: 10,
    width: "28%"
  },
  photoDots: {
    flexDirection: "row",
    gap: 6,
    left: 18,
    position: "absolute",
    right: 18,
    top: 14
  },
  photoDot: {
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    borderRadius: 999,
    flex: 1,
    height: 4
  },
  photoDotActive: {
    backgroundColor: "#FFFFFF"
  },
  cardOverlay: {
    backgroundColor: "rgba(36, 28, 33, 0.58)",
    gap: 8,
    padding: 22
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  name: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 31,
    fontWeight: "900"
  },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: "#E94163",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5
  },
  metaText: {
    color: "#FFF5F7",
    fontSize: 14,
    fontWeight: "800"
  },
  bio: {
    color: "#FFF5F7",
    fontSize: 16,
    lineHeight: 23
  },
  detailRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 5
  },
  infoPill: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  infoPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800"
  },
  interestsSection: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginTop: 14,
    padding: 14
  },
  sectionTitle: {
    color: "#241C21",
    fontSize: 16,
    fontWeight: "900"
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
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  chipText: {
    color: "#55454D",
    fontSize: 13,
    fontWeight: "800"
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
    paddingTop: 20
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 36,
    height: 64,
    justifyContent: "center",
    width: 64
  },
  primaryAction: {
    backgroundColor: "#E94163",
    height: 74,
    width: 74
  },
  secondaryAction: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderWidth: 1
  },
  emptyTitle: {
    color: "#241C21",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 12
  },
  emptyText: {
    color: "#6F5962",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center"
  }
});
