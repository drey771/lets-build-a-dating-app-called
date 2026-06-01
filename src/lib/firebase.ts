import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FirebaseAuthRN from "@firebase/auth";
import { FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, Persistence } from "firebase/auth";
import { Platform } from "react-native";

const { getReactNativePersistence } = FirebaseAuthRN as unknown as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

function createFirebaseAuth() {
  if (Platform.OS === "web") {
    return getAuth(firebaseApp);
  }

  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const firebaseAuth = createFirebaseAuth();
