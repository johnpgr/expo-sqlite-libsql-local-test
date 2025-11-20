# expo-sqlite libSQL Local Database Test

Minimal reproduction demonstrating that expo-sqlite doesn't support local-only databases when `useLibSQL` is enabled, despite the underlying libsql C library supporting this capability.

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

## libSQL C Library Supports Local Databases

expo-sqlite uses the [tursodatabase/libsql](https://github.com/tursodatabase/libsql) experimental C library.

The C header (`libsql.h`) exposes these database opening functions:

```c
// Local file database - NO URL/TOKEN REQUIRED
int libsql_open_file(const char *path, libsql_database_t *out_db, const char **out_err_msg);

// Remote database
int libsql_open_remote(const char *url, const char *auth_token, libsql_database_t *out_db, const char **out_err_msg);

// Synced database (local + remote)
int libsql_open_sync(const char *db_path, const char *primary_url, const char *auth_token, ...);
```

**The underlying library has `libsql_open_file()` for local-only databases**, but expo-sqlite doesn't expose this capability. It only calls the sync/remote functions that require URL and auth token.

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

1. Open local-only database by omitting `libSQLOptions` (calls `libsql_open_file` internally), OR
2. Use `file:` URL in `libSQLOptions.url` for embedded database

This would allow apps to use local storage before user authentication, then switch to synced storage after login.

## References

- [tursodatabase/libsql](https://github.com/tursodatabase/libsql) - The libsql library
- [expo-sqlite libsql.h](https://github.com/expo/expo/blob/main/packages/expo-sqlite/android/libsql/libsql.h) - C header showing available functions
- [Turso local-only docs](https://docs.turso.tech/sdk/ts/reference#local-only) - TypeScript SDK local database support
