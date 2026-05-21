# Datez Android Setup

## Local phone testing

1. Install **Expo Go** from the Google Play Store.
2. Make sure your computer and Android phone are on the same Wi-Fi network.
3. Start Datez:

```bash
npm run start -- --clear
```

4. Scan the QR code with Expo Go.

If LAN does not connect, use tunnel mode:

```bash
npx expo start --tunnel --clear
```

## Google sign-in on Android

For a real Android build, create an Android OAuth client in Google Cloud:

- Application type: **Android**
- Package name: `com.datez.app`
- SHA-1 certificate fingerprint: your Android signing certificate SHA-1

Then add the Android client ID to `.env`:

```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

Keep these web values too, because they are still used when testing in the browser:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

For local web testing, Google Cloud should still contain:

- Authorized JavaScript origin: `http://localhost:8081`
- Authorized redirect URI: `http://localhost:8081/oauth`

## Firebase

Firebase Authentication must have **Google** enabled under:

Authentication > Sign-in method > Google

## Supabase

The same Supabase URL and anon key work on Android:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
