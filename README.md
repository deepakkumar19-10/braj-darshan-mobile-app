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

The APK is `android/app/build/outputs/apk/release/app-release.apk`. It is signed with the
standard debug key for now (a release key is a later step), so it installs over earlier test builds.

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
