import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

const starterProfileImage =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80";

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Discover</Text>
          <Text style={styles.title}>Datez</Text>
        </View>
        <Pressable accessibilityLabel="Filter matches" style={styles.iconButton}>
          <Ionicons name="options" size={22} color="#241C21" />
        </Pressable>
      </View>

      <ImageBackground source={{ uri: starterProfileImage }} imageStyle={styles.cardImage} style={styles.card}>
        <View style={styles.cardOverlay}>
          <Text style={styles.name}>Amara, 27</Text>
          <Text style={styles.bio}>Coffee walks, live music, and Sunday market dates.</Text>
        </View>
      </ImageBackground>

      <View style={styles.actions}>
        <Pressable accessibilityLabel="Pass" style={[styles.actionButton, styles.secondaryAction]}>
          <Ionicons name="close" size={30} color="#6F5962" />
        </Pressable>
        <Pressable accessibilityLabel="Like" style={[styles.actionButton, styles.primaryAction]}>
          <Ionicons name="heart" size={34} color="#FFFFFF" />
        </Pressable>
        <Pressable accessibilityLabel="Send message" style={[styles.actionButton, styles.secondaryAction]}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#6F5962" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8FA",
    flex: 1,
    padding: 20,
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
    fontWeight: "700",
    textTransform: "uppercase"
  },
  title: {
    color: "#241C21",
    fontSize: 34,
    fontWeight: "800"
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
  card: {
    borderRadius: 28,
    flex: 1,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  cardImage: {
    borderRadius: 28
  },
  cardOverlay: {
    backgroundColor: "rgba(36, 28, 33, 0.46)",
    gap: 8,
    padding: 24
  },
  name: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800"
  },
  bio: {
    color: "#FFF5F7",
    fontSize: 16,
    lineHeight: 23
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
    paddingVertical: 24
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
  }
});
