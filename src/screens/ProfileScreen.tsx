import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";

export function ProfileScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user?.photoURL ? <Image source={{ uri: user.photoURL }} style={styles.avatar} /> : <View style={styles.avatarFallback} />}
      <Text style={styles.name}>{user?.displayName ?? "Datez Member"}</Text>
      <Text style={styles.email}>{user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#FFF8FA",
    flex: 1,
    padding: 20,
    paddingTop: 62
  },
  title: {
    alignSelf: "flex-start",
    color: "#241C21",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 34
  },
  avatar: {
    borderRadius: 58,
    height: 116,
    marginBottom: 18,
    width: 116
  },
  avatarFallback: {
    backgroundColor: "#E94163",
    borderRadius: 58,
    height: 116,
    marginBottom: 18,
    width: 116
  },
  name: {
    color: "#241C21",
    fontSize: 24,
    fontWeight: "800"
  },
  email: {
    color: "#6F5962",
    fontSize: 15,
    marginTop: 6
  }
});
