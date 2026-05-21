import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AuthScreen } from "./screens/AuthScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { MainTabs } from "./navigation/MainTabs";
import React from "react";

function AppContent() {
  const { booting, splashVisible, user } = useAuth();

  if (booting || splashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthScreen />}
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
