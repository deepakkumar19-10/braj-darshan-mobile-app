# Braj Darshan — mobile app (Expo)

The app is a pure [Expo](https://docs.expo.dev) project (SDK 58). There is no React Native CLI:
the `android/` and `ios/` folders are **generated** from `app.json` by `npx expo prebuild`
(Continuous Native Generation) and are git-ignored. Change native settings (name, package, icon,
splash, permissions, deep-link scheme) in `app.json`, never in `android/`.

## Run on your phone with Expo Go

1. Install **Expo Go** from the Play Store.
2. In this folder run:

   ```sh
   npm install
   npx expo start
   ```

3. Scan the QR code with Expo Go (phone and computer on the same Wi-Fi).

## Build an APK

```sh
npm run prebuild          # npx expo prebuild --clean --platform android
cd android
gradlew.bat assembleRelease
```

The APK is `android/app/build/outputs/apk/release/app-release.apk`. A local build is signed with
the standard debug key, so it is for testing only. It holds ARM libraries only (`arm64-v8a`,
`armeabi-v7a`), set by `expo-build-properties` in `app.json`.

Release APKs are built with EAS, which keeps the signing key in the Expo account (`eas.json`):

```sh
npx eas-cli@latest build -p android --profile preview      # test APK
npx eas-cli@latest build -p android --profile production   # release APK
```

## Version

`app.json` is the only place to set it: `expo.version` (e.g. `1.0.0`) and
`expo.android.versionCode` (raise it by 1 for every APK you share). Keep `package.json`'s
`version` the same; a test checks this. The app shows the version from the build in Settings → About.

## Checks

```sh
npx tsc --noEmit
npx eslint .
npx jest
npx expo-doctor
```

## Bhakti audio

Bhajans, aartis, path, pravachan, kirtan and live darshan open on the **official YouTube upload or
channel** of whoever owns them (`src/data/bhakti.json`, a copy of the website's
`packages/data/data/v3/bhakti.json`; `node packages/data/scripts/check-sync.mjs` checks the copy).
The app streams nothing itself, so the views and revenue go to the owner. Naam jap uses the phone's
own text-to-speech voice through `expo-speech`.
