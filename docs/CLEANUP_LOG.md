# Cleanup log (branch `stage/a3-release-prep`, 4 Nov 2026)

What was removed, why it was safe, and how much it saved. Based on audit §6 and §7
(`APP-WEB-BRAJ/Braj-Drashan/docs/audit/APP_AUDIT_2026-11-04.md`). Every item was
re-checked with `git grep` on this branch before removal. Deleted files stay in git
history; `git checkout 5892bc9 -- <path>` brings one back.

None of the removed files or packages was in the APK (Metro bundles only what the app
`import`s or `require`s), so they shrink the repository, not the app.

## Summary

| What | Files | Size saved |
|---|---:|---:|
| Unused components and barrels | 8 | 11,946 bytes |
| `@react-navigation/bottom-tabs` dependency | 145 in `node_modules` (not tracked) | 386,672 bytes unpacked |
| Never-required images | 39 | 178,659,398 bytes (178.7 MB) |
| `docs/screenshots/` | 98 PNGs | 60,698,482 bytes (60.7 MB) |
| **Total in the repo** | **145 tracked files** | **239,369,826 bytes (239.4 MB)** |

## 1. Components and barrels

Checks (both returned nothing, exit 1):

```
$ git grep -nE "AppButton|LotusIcon|MorpankhIcon|common/Badge|[^s]Badge\b" -- . ':!src/components/common' ':!package-lock.json'
$ git grep -nE "(from|require\()\s*['\"][./]*([^'\"]*/)?(common|navigation|i18n|images)(/index)?['\"]" -- src App.tsx index.js __tests__
```

The first finds any use of the four components outside their own folder (`StatusBadge`
in `components/ui` is a different component and is kept). The second finds any import of
the folders `common`, `navigation`, `i18n` or `images` as a barrel (`'../common'`,
`'../navigation/index'` and so on). App code imports the files inside them directly,
for example `../../navigation/routes` and `../i18n/locales/en.json`.

| File | Bytes | Evidence |
|---|---:|---|
| `src/components/common/AppButton.jsx` | 4,560 | Only re-exported by `common/index.js`. |
| `src/components/common/Badge.jsx` | 1,470 | Only re-exported by `common/index.js`. |
| `src/components/common/LotusIcon.jsx` | 1,794 | Only re-exported by `common/index.js`. |
| `src/components/common/MorpankhIcon.jsx` | 3,204 | Only re-exported by `common/index.js`. |
| `src/components/common/index.js` | 363 | No import of `components/common` or `common/index`. `AppText` and `Icon` are imported from their own files and stay. |
| `src/navigation/index.js` | 155 | `App.tsx` imports `./src/navigation/RootNavigator` directly. |
| `src/i18n/index.js` | 208 | `LanguageContext.jsx` imports `../i18n/locales/en.json` and `hi.json` directly. The locale files stay. |
| `src/assets/images/index.js` | 192 | No import of `assets/images` or its index. |

Kept on purpose:
- `Scrim` in `components/ui/index.jsx`. The audit lists it as unused, but `ui/index.jsx:540` uses it (`{scrim ? <Scrim /> : null}`).
- The Profile screen, the three auth screens, `AuthNavigator` and `CustomDrawer`. They cannot be reached, but removing them is the owner's decision.
- Unused `storageService` helpers (`getRecentTemples`, `addRecentTemple`, `getSettings`, `saveSettings`, `getCache`, `setCache`). They were not in this task's list.

## 2. Dependency `@react-navigation/bottom-tabs`

```
$ git grep -n "bottom-tabs" 5892bc9 -- .
5892bc9:package-lock.json:14:        "@react-navigation/bottom-tabs": "^7.19.2",
5892bc9:package-lock.json:4050:    "node_modules/@react-navigation/bottom-tabs": {
5892bc9:package-lock.json:4052:      "resolved": "https://registry.npmjs.org/@react-navigation/bottom-tabs/-/bottom-tabs-7.19.2.tgz",
5892bc9:package.json:18:    "@react-navigation/bottom-tabs": "^7.19.2",
```

Only `package.json` and the lock file named it: no import in `src`, `App.tsx`, the tests,
`app.json` or the Jest/Babel/Metro configs. The tab bar is the app's own `StitchTabBar`.
Removed with `npm uninstall @react-navigation/bottom-tabs`; npm removed 1 package.
Size: 386,672 bytes unpacked, 145 files (`npm view @react-navigation/bottom-tabs@7.19.2 dist.unpackedSize dist.fileCount`).
It is pure JavaScript, so the native build does not change.

Not removed: `@babel/preset-env` and `@react-native/babel-preset` (devDependencies). No
config names them, but the audit marks their removal as not verified, and they were not in
this task's list.

## 3. Images (39 files)

Method: a script listed every `require('...png|jpg|avif|svg|webp|gif')` in the tracked
`.js/.jsx/.ts/.tsx` files, resolved each path, and compared the result with
`git ls-files src/assets/images`. 39 of the 86 tracked images were never required.
It also searched every tracked text file for each file name, to catch non-`require` uses.

The text mentions it found are not uses:
- `src/data/*.json` name website paths such as `/images/places/mathura.avif`. The app's
  `imageFromDataPath()` drops the extension and looks the name up in `IMAGES_BY_NAME`,
  which only holds `.jpg` files.
- `src/utils/imageAssets.js` mentions `mathura.avif` in a comment.
- `gokul.jpg` matched `places/gokul.jpg` (kept, required). `temples/gokul.jpg` is not required.
- `logo.png` matched `brand/braj-logo.png` (kept, required by Home, More and Login).

After the removal the same script reports "required images that do not exist: none".

Two more images are now never required: `braj-darshan-logo.png` (5,453,619 bytes) and
`braj-icon.png` (229,206 bytes). Only the removed `assets/images/index.js` required them.
They are **kept** because they were not in the list of 39. Removing them is the owner's call.

| File | Bytes | Text mentions (not a require) |
|---|---:|---|
| `brand/home-hero.jpg` | 88,415 | none |
| `events/annakoot-mahotsav.png` | 3,695,830 | none |
| `events/bgc.avif` | 46,225 | none |
| `events/bgc.jpg` | 39,213 | none |
| `events/braj-parikrama.png` | 10,430,252 | none |
| `events/gopal-janmotsav-gokul.png` | 9,953,148 | none |
| `events/govardhan-puja.png` | 3,529,971 | none |
| `events/jhulan-utsav-vrindavan.png` | 9,563,076 | none |
| `events/krishna-janmashtami-mathura.png` | 3,366,200 | none |
| `events/lathmar-holi-barsana.png` | 3,062,787 | none |
| `events/phoolon-ki-holi-vrindavan.png` | 3,525,144 | none |
| `events/radhashtami-barsana.png` | 10,134,626 | none |
| `food/aloo-tikki.png` | 8,708,561 | none |
| `food/jalebi.png` | 6,742,986 | none |
| `food/kachori-sabzi.png` | 7,026,274 | none |
| `food/kulhar-lassi.png` | 6,530,961 | none |
| `food/malai-makkhan.png` | 6,114,338 | none |
| `food/mathura-peda.png` | 6,580,682 | none |
| `food/puri-sabzi.png` | 7,387,517 | none |
| `food/rabri.png` | 6,876,623 | none |
| `logo.png` | 9,038,000 | `src/assets/images/index.js`, `src/screens/auth/LoginScreen.jsx`, `src/screens/home/HomeScreen.jsx`, `src/screens/more/MoreScreen.jsx` |
| `places/chandrawal-maiya.png` | 9,841,443 | none |
| `places/dauji.png` | 10,076,319 | none |
| `places/mahadev.avif` | 60,349 | `src/data/places.json` |
| `places/mathura.avif` | 100,448 | `src/data/places.json`, `src/utils/imageAssets.js` |
| `places/raman-reti.png` | 8,335,240 | none |
| `places/vrindavan.avif` | 103,430 | `src/data/places.json` |
| `temples/banke-bihari.avif` | 54,587 | `src/data/temples.json` |
| `temples/chandrawal-maiya.png` | 9,376,630 | none |
| `temples/dauji.png` | 8,837,280 | none |
| `temples/default-temple.svg` | 994 | `src/data/temples.json` |
| `temples/dwarkadhish.avif` | 182,140 | none |
| `temples/dwarkadhish.jpg` | 134,958 | none |
| `temples/gokul.avif` | 143,029 | none |
| `temples/gokul.jpg` | 107,322 | `src/data/places.json`, `src/utils/festivalImages.js`, `src/utils/imageAssets.js` |
| `temples/krishna-janmabhoomi.avif` | 280,538 | `src/data/temples.json` |
| `temples/prem-mandir.avif` | 65,471 | `src/data/temples.json` |
| `temples/radha-rani.avif` | 183,151 | `src/data/temples.json` |
| `temples/raman-reti.png` | 8,335,240 | none |

Total: 39 files, 178,659,398 bytes (178.7 MB).
25 of them are multi-MB PNG originals of a `.jpg` that the app does use, plus `logo.png`.

## 4. `docs/screenshots/` (98 PNGs)

```
$ git grep -n "screenshots" 5892bc9 -- . ':!docs/screenshots' ':!.gitignore'
(no output, exit 1)
```

Nothing in the app, the tests, the configs or the README links to them. They are QA
screenshots from earlier phases, and some show the old drawer UI. The `reports/` and `docs/`
folders next to the app do not link to them either. 98 files, 60,698,482 bytes
(`git ls-tree -r -l 5892bc9 docs/screenshots`).

## 5. Other small changes in the same pass

- Guest user email: `guest@brajdarshan.org` is now `''` (`src/context/AuthContext.jsx`).
  `git grep` shows no screen reads `user.email`. Only the unreachable auth screens use the
  word "email", for their own input fields.
- "Clear offline data" in Settings now also deletes the downloaded temple and place copies
  (`@braj_content_v1_*`), and the app switches back to its built-in data at once.
  New tests are in `__tests__/contentService.test.js`.
