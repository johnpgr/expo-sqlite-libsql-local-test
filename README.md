# expo-sqlite libSQL Local Database Test

Minimal reproduction for expo-sqlite issue: Cannot open local-only database when `useLibSQL` is enabled.

## Issue

When `useLibSQL: true` is configured in app.json, calling `openDatabaseSync()` without `libSQLOptions` throws:

```
Error: Call to function 'NativeDatabase.constructor' has been rejected.
→ Caused by: Invalid arguments: libSQLUrl must be provided
```

## Reproduce

```bash
# Install dependencies
npm install

# Build and run on Android
npx expo prebuild --clean
npx expo run:android

# Or iOS
npx expo run:ios
```

## Expected

Local-only database should work without requiring libSQL URL/token.

## Use Case

Multi-tenant apps where:
- Guest mode uses local SQLite (no credentials yet)
- Authenticated mode uses libSQL sync to user's Turso database

Currently impossible - must provide libSQL credentials for ALL database operations when `useLibSQL` is enabled.
