import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";

export function AuthScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="heart" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Datez</Text>
        <Text style={styles.subtitle}>Meet someone with intention, warmth, and a little bit of magic.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={handleGoogleSignIn}
        style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#241C21" />
        ) : (
          <>
            <Ionicons name="logo-google" size={22} color="#241C21" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8FA",
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingBottom: 44,
    paddingTop: 92
  },
  hero: {
    gap: 14
  },
  logo: {
    alignItems: "center",
    backgroundColor: "#E94163",
    borderRadius: 24,
    height: 78,
    justifyContent: "center",
    marginBottom: 18,
    width: 78
  },
  title: {
    color: "#241C21",
    fontSize: 48,
    fontWeight: "800"
  },
  subtitle: {
    color: "#6F5962",
    fontSize: 18,
    lineHeight: 27,
    maxWidth: 340
  },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8D5DC",
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    flexDirection: "row",
    gap: 12,
    height: 58,
    justifyContent: "center",
    shadowColor: "#241C21",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16
  },
  googleButtonText: {
    color: "#241C21",
    fontSize: 16,
    fontWeight: "700"
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }]
  },
  buttonDisabled: {
    opacity: 0.7
  }
});
