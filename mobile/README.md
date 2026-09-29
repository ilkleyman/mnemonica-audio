# Mnemonica — Android wrapper

An Expo shell that loads the live PWA from
https://ilkleyman.github.io/mnemonica-audio/ in a WebView.

The app itself is not bundled into the APK. That means a deploy to GitHub Pages
reaches the phone with no rebuild — you only rebuild this when the shell itself
changes (icon, package name, WebView settings). The page's service worker caches
itself and the audio on first run, so it works offline after that; the first
launch does need a connection.

## Build the APK

Needs Node 20+. From this directory:

```sh
npm install
```

**Cloud build (no Android Studio):**

```sh
npx eas login          # an Expo account, free tier is fine
npx eas build --platform android --profile preview
```

The `preview` profile is set to `buildType: apk`, so it produces an installable
APK rather than an AAB. EAS gives you a download link when it finishes.

**Local build (needs Android Studio + SDK):**

```sh
npm run apk:local
```

or, to drive Gradle yourself:

```sh
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleRelease
# app/build/outputs/apk/release/app-release.apk
```

`android/` is generated and gitignored — never edit it by hand, it is recreated
on every prebuild.

## Releasing a new version

Bump both in `app.json`: `expo.version` (shown to humans) and
`expo.android.versionCode` (must increase for Android to treat it as an
upgrade rather than refusing to install over the old one).

## Notes

- `mediaPlaybackRequiresUserAction={false}` is what lets the audio chain keep
  playing after Start; without it Android blocks every clip after the first.
- `expo-keep-awake` holds the screen on natively, because `navigator.wakeLock`
  is not reliable inside a WebView.
- Only `INTERNET` is requested. Expo's default storage and overlay permissions
  are stripped in `app.json` via `blockedPermissions`.
- Audio with the screen off is not guaranteed — Android may suspend a
  backgrounded WebView. If that matters, it needs a native foreground service,
  which this shell does not set up.
