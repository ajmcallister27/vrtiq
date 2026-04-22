# Packaging vrtIQ for the Apple App Store and Google Play

This guide explains how to ship the existing Vite React app in this repo as native store apps.

The recommended approach for this project is:
- Keep the current web frontend as-is.
- Wrap the built `dist/` output with Capacitor.
- Point the app to the production backend API over HTTPS.

This is the safest path because the current app already has a production backend and API contract.

## 1) Current project assumptions (important)

This guide is based on the current codebase behavior:
- Frontend build is Vite (`npm run build`) and outputs to `dist/`.
- API client uses `VITE_API_BASE_URL` when set, otherwise defaults to `/api`.
- Backend API routes are under `/api/v1/*`.
- Backend CORS is explicit allowlist only in production.

Why this matters for mobile:
- In Capacitor, the app runs from a WebView origin (`capacitor://localhost` on iOS, `http://localhost` on Android).
- Relative `/api` will not route through your Vite dev proxy in production mobile builds.
- You must provide an absolute `VITE_API_BASE_URL` for mobile builds.
- You must allow mobile WebView origins in backend CORS.

## 2) Prerequisites

### Accounts
- Apple Developer Program account (for App Store / TestFlight).
- Google Play Console account.

### Tooling
- Node.js and npm (already used by this repo).
- For Android builds: Android Studio + Android SDK.
- For iOS builds: macOS + Xcode (required by Apple toolchain).

> Note: You can develop on Windows, but final iOS build/sign/upload requires macOS/Xcode (local Mac or CI provider with macOS runners).

## 3) One-time Capacitor setup in this repo

Run at repo root:

```bash
npm install @capacitor/core @capacitor/android @capacitor/ios
npm install -D @capacitor/cli
npx cap init "vrtIQ" "com.vrtiq.app" --web-dir=dist
```

Then add platforms:

```bash
npx cap add android
npx cap add ios
```

What this creates:
- `capacitor.config.*`
- `android/`
- `ios/`

Recommended app ID conventions:
- Production: `com.vrtiq.app`
- Keep this stable forever after first store release.

## 4) Configure mobile production API base URL

Create a Vite mode file for mobile releases:

`/.env.mobile`

```env
VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1
```

Build using that mode:

```bash
npx vite build --mode mobile
```

Or keep using npm script style:

```bash
npm run build -- --mode mobile
```

Then sync web assets into native projects:

```bash
npx cap sync
```

## 5) Update backend CORS allowlist for mobile WebViews

In production backend env (`CORS_ALLOWED_ORIGINS`), include:
- Your web origins (for example `https://vrtiq.com`)
- `capacitor://localhost` (iOS)
- `http://localhost` (Android)

Example:

```text
https://vrtiq.com,https://www.vrtiq.com,capacitor://localhost,http://localhost
```

Without this, login/data calls from native apps will fail with CORS errors.

## 6) Android packaging (Google Play)

### 6.1 Open Android project

```bash
npx cap open android
```

In Android Studio:
- Let Gradle sync finish.
- Set app name, icon, splash/launch branding.
- Confirm `applicationId` matches your chosen app ID.

### 6.2 Configure signing key (upload key)

Create keystore (one time):

```bash
keytool -genkey -v -keystore vrtiq-upload.jks -alias vrtiq-upload -keyalg RSA -keysize 2048 -validity 10000
```

Store keystore safely (password manager + secure backup).

Configure signing in Android project (`keystore.properties` + Gradle signingConfig) and build release bundle.

### 6.3 Build AAB

Use Android Studio:
- Build -> Generate Signed Bundle / APK
- Choose Android App Bundle (AAB)
- Choose release signing config

Or CLI from `android/`:

```bash
gradlew.bat bundleRelease
```

Output is typically under:
- `android/app/build/outputs/bundle/release/app-release.aab`

### 6.4 Play Console upload

- Create app in Play Console.
- Upload `.aab` to Internal testing track first.
- Complete required forms:
  - Data safety
  - App content rating
  - Target audience
  - Privacy policy URL
- Add store listing assets (icon, screenshots, feature graphic).
- Promote to Closed/Open/Production after QA.

## 7) iOS packaging (App Store)

### 7.1 iOS build environment requirement

You must build/sign iOS on macOS with Xcode.

If your main machine is Windows:
- Use a Mac machine, or
- Use a CI service with macOS runners to produce archives.

### 7.2 Open iOS project

On macOS at repo root:

```bash
npx cap open ios
```

In Xcode:
- Select the app target.
- Set Bundle Identifier (must match App Store Connect app record).
- Set Team/Signing (Automatic signing is simplest initially).
- Set Version and Build number.
- Configure app icon and launch screen assets.

### 7.3 Validate network/security

- API must be HTTPS in release (`VITE_API_BASE_URL=https://...`).
- Avoid HTTP endpoints to pass ATS requirements.

### 7.4 Archive and upload

In Xcode:
- Product -> Archive
- Organizer -> Distribute App -> App Store Connect -> Upload

Then in App Store Connect:
- Add TestFlight build testers.
- Complete app privacy questionnaire.
- Complete metadata (screenshots, description, keywords, support URL, privacy policy).
- Submit for review.

## 8) Release workflow for every app update

From repo root:

```bash
npm ci
npm run build -- --mode mobile
npx cap sync
```

Then:
- Android: rebuild signed AAB, upload new versionCode/versionName.
- iOS: increment build number, archive/upload new build.

## 9) Versioning and release discipline

Use a predictable version policy:
- Marketing version (e.g. `1.4.0`) shown to users.
- Build number/version code increment for every upload.

Minimum checklist before each store submission:
- App launches cleanly on physical device.
- Login works against production backend.
- Create/edit entity flows work.
- No console/network errors in critical flows.
- CORS is correct for both WebView origins.
- Privacy policy and data safety answers still match real behavior.

## 10) Optional automation (recommended)

You can add root scripts like:

```json
{
  "scripts": {
    "mobile:build": "vite build --mode mobile",
    "mobile:sync": "npx cap sync",
    "mobile:android": "npm run mobile:build && npm run mobile:sync && npx cap open android",
    "mobile:ios": "npm run mobile:build && npm run mobile:sync && npx cap open ios"
  }
}
```

This keeps release steps consistent across team members.

## 11) Common failure points for this repo

- Using relative `/api` in mobile build instead of absolute `https://.../api/v1`.
- Forgetting to include `capacitor://localhost` and `http://localhost` in backend CORS allowlist.
- Trying to produce iOS release artifacts on Windows.
- Uploading unsigned Android artifacts or APK instead of AAB for Play production.
- Changing app/bundle ID after first store release.

---

If you want, the next step is to add Capacitor and platform folders directly in this repo and wire release scripts in `package.json` so this guide is immediately executable.