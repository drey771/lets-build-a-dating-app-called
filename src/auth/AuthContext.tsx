import * as React from "react";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithCredential,
  signOut
} from "firebase/auth";
import { firebaseAuth } from "../lib/firebase";
import { upsertProfile } from "../lib/profiles";

WebBrowser.maybeCompleteAuthSession();

if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
  });
}

type AuthContextValue = {
  booting: boolean;
  splashVisible: boolean;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const MINIMUM_SPLASH_MS = 1600;
const googleRedirectUri =
  Platform.OS === "web"
    ? makeRedirectUri({
        scheme: "datez",
        path: "oauth",
        preferLocalhost: true
      })
    : makeRedirectUri({
        scheme: "datez",
        path: "oauthredirect"
      });

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [booting, setBooting] = React.useState(true);
  const [splashVisible, setSplashVisible] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri: googleRedirectUri,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  });

  React.useEffect(() => {
    const splashTimer = setTimeout(() => setSplashVisible(false), MINIMUM_SPLASH_MS);

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser);
      setBooting(false);

      if (currentUser) {
        await upsertProfile(currentUser);
      }
    });

    return () => {
      clearTimeout(splashTimer);
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    async function finishGoogleSignIn() {
      if (response?.type !== "success") {
        return;
      }

      const idToken = response.params?.id_token ?? response.authentication?.idToken;

      if (!idToken) {
        throw new Error("Google did not return an id token. Check your OAuth client configuration.");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(firebaseAuth, credential);
    }

    finishGoogleSignIn();
  }, [response]);

  const signInWithGoogle = React.useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const signInResult = await GoogleSignin.signIn();
        const idToken = signInResult.data?.idToken;

        if (!idToken) {
          throw new Error("Google did not return an Android id token. Check your web client ID.");
        }

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(firebaseAuth, credential);
      } catch (error) {
        const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;

        if (code === statusCodes.SIGN_IN_CANCELLED) {
          return;
        }

        throw error;
      }

      return;
    }

    await promptAsync();
  }, [promptAsync]);

  const signOutUser = React.useCallback(async () => {
    await signOut(firebaseAuth);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ booting, splashVisible, user, signInWithGoogle, signOutUser }),
    [booting, splashVisible, user, signInWithGoogle, signOutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = React.useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
