# PostHog Source Map Upload — Setup Report

## Files changed

| File | Change |
|---|---|
| `metro.config.js` | Created — switches Metro to `getPostHogExpoConfig` from `posthog-react-native/metro` so debug IDs are injected into JS bundles |
| `app.json` | Updated `posthog-react-native/expo` plugin entry: `uploadNativeSymbols` now includes `{ "includeSource": true }`, added `"dotenvFile": ".env"` for local credential loading |
| `.env` | Added `POSTHOG_CLI_API_KEY`, `POSTHOG_CLI_PROJECT_ID`, `POSTHOG_CLI_HOST` |

## Env vars written to `.env`

```
POSTHOG_CLI_API_KEY=<your personal API key>
POSTHOG_CLI_PROJECT_ID=247144
POSTHOG_CLI_HOST=https://eu.posthog.com
```

> Never commit `.env` — it should be (and is) in `.gitignore`.

## Build commands

### Production (EAS Build — uploads source maps automatically)

```
eas build -p ios --profile production
eas build -p android --profile production
```

### Local release build (also uploads source maps)

```
npx expo run:ios --configuration Release
npx expo run:android --variant release
```

Source maps and native symbols upload automatically when the native build runs (iOS: dSYMs via Xcode Run Script; Android: ProGuard/R8 mappings via Gradle plugin). EAS OTA updates require a separate manual upload — see "EAS Updates" below.

## CI — EAS Build (already wired)

`eas.json` already contains `POSTHOG_CLI_API_KEY`, `POSTHOG_CLI_PROJECT_ID`, and `POSTHOG_CLI_HOST` in all three profiles (development, preview, production). No further CI file changes are needed.

### Action required — migrate the hardcoded key to an EAS secret

The `POSTHOG_CLI_API_KEY` value is currently **hardcoded in plaintext inside `eas.json`**, which is checked into version control. This is a security risk. Migrate it to an EAS secret so the key never appears in git:

1. Create the secret:
   ```
   eas secret:create --scope project --name POSTHOG_CLI_API_KEY --value <your-personal-api-key>
   ```
2. Remove the hardcoded `POSTHOG_CLI_API_KEY` entries from `eas.json` (EAS secrets are automatically injected as environment variables and take precedence).
3. Repeat step 1 for `POSTHOG_CLI_PROJECT_ID` and `POSTHOG_CLI_HOST` if you want to fully clean up `eas.json`, or leave those two (they're not sensitive).

## EAS Updates (OTA) — manual upload required

If you use `eas update` for over-the-air JS updates, the automatic Gradle/Xcode upload does **not** run (it's a native-build-only hook). Upload source maps manually after each OTA update:

```
posthog-cli hermes upload --directory dist
```

(`dist` is the default EAS Update output directory.)

## Verify the upload

After your next production build, confirm a symbol set was created:

https://eu.posthog.com/project/247144/error_tracking/configuration

A new row should appear in the **Symbol sets** tab within a few minutes of the build completing.
