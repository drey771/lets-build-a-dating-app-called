import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function ChatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <Text style={styles.empty}>Your matches and conversations will show up here.</Text>
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
    marginBottom: 12
  },
  empty: {
    color: "#6F5962",
    fontSize: 16,
    lineHeight: 24
  }
});
