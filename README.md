# expo-sqlite libSQL Local Database Test

Minimal reproduction demonstrating that expo-sqlite doesn't support local-only databases when `useLibSQL` is enabled, despite libSQL itself supporting this capability.

## The Issue

When `useLibSQL: true` is configured in app.json, `openDatabaseSync()` requires `libSQLOptions` with a valid remote URL and auth token. There's no way to open a local-only embedded database.

**Error:**
```
Error: Call to function 'NativeDatabase.constructor' has been rejected.
→ Caused by: Invalid arguments: libSQLUrl must be provided
```

## Tests Performed

1. **expo-sqlite without options** → FAILS
   ```typescript
   openDatabaseSync('local.db')
   ```

2. **expo-sqlite with file: URL** → FAILS
   ```typescript
   openDatabaseSync('local.db', {
     libSQLOptions: { url: 'file:local.db', authToken: '' }
   })
   ```

3. **@libsql/client with file: URL** → Shows libSQL capability
   ```typescript
   createClient({ url: 'file:local.db' })
   ```

## libSQL Supports Local Databases

The libSQL library itself fully supports local-only embedded databases:

- [libSQL documentation](https://docs.turso.tech/sdk/ts/reference#local-only) shows `file:` URL support
- `createClient({ url: "file:local.db" })` creates an embedded database
- No remote URL or auth token required

expo-sqlite should expose this capability when `useLibSQL` is enabled.

## Use Case

Multi-tenant apps with per-user Turso databases:

- **Guest mode**: Local SQLite storage (no account, no Turso credentials)
- **Authenticated mode**: libSQL sync to user's personal Turso database

Currently impossible - must provide remote Turso credentials for ALL database operations when `useLibSQL` is enabled.

## Reproduce

```bash
npm install
npx expo prebuild --clean
npx expo run:android  # or run:ios
```

## Expected Behavior

When `useLibSQL` is enabled, should be able to:

1. Open local-only database by omitting `libSQLOptions`, OR
2. Use `file:` URL in `libSQLOptions.url` for embedded database

This would allow apps to use local storage before user authentication, then switch to synced storage after login.
