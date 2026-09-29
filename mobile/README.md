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

**Cloud build on EAS — the default, no Android Studio needed:**

```sh
npm run login
npm run apk
```

`eas-cli` is a devDependency, so these work straight after `npm install`.
Do NOT use `npx eas` — there is an unrelated `eas` package on npm with no
executable, and npx picks that up and fails with "could not determine
executable to run". The real CLI is `eas-cli`; its binary is just named `eas`.

The `preview` profile sets `buildType: apk`, so you get an installable APK
rather than an AAB, and `distribution: internal`, so EAS returns a QR code you
can scan on the phone to install straight from it — no cable, no file copying.

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

`eas.json` sets `cli.appVersionSource: "remote"` with `autoIncrement`, so EAS
owns `versionCode` and bumps it each build. Nothing to remember — you can't
produce an APK Android refuses to install over the previous one.

Bump `expo.version` in `app.json` only when you want the human-facing version
string to change.

EAS generates a signing keystore on the first build and keeps it. Let it —
future builds must be signed with the same key or they won't install as an
upgrade. `npm exec -- eas credentials` shows it.

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
