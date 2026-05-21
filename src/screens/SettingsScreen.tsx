import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";

export function SettingsScreen() {
  const { signOutUser } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Pressable accessibilityRole="button" onPress={signOutUser} style={styles.row}>
        <View style={styles.rowIcon}>
          <Ionicons name="log-out-outline" size={22} color="#E94163" />
        </View>
        <Text style={styles.rowText}>Sign out</Text>
      </Pressable>
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
  title: {
    color: "#241C21",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 28
  },
  row: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DCE2",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: "#FFF0F4",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  rowText: {
    color: "#241C21",
    fontSize: 16,
    fontWeight: "700"
  }
});
