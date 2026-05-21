import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function SplashScreen() {
  return (
    <LinearGradient colors={["#FFF7F9", "#FFE2EA"]} style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>D</Text>
      </View>
      <Text style={styles.brand}>Datez</Text>
      <Text style={styles.tagline}>Find a spark worth keeping.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  logo: {
    alignItems: "center",
    backgroundColor: "#E94163",
    borderRadius: 30,
    height: 96,
    justifyContent: "center",
    marginBottom: 22,
    width: 96
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "800"
  },
  brand: {
    color: "#241C21",
    fontSize: 42,
    fontWeight: "800"
  },
  tagline: {
    color: "#6F5962",
    fontSize: 16,
    marginTop: 8
  }
});
