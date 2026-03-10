import type { SQLiteDatabase } from "expo-sqlite";

const CURRENT_SCHEMA_VERSION = 2;

const migrations: Record<number, string[]> = {
  1: [
    `CREATE TABLE IF NOT EXISTS movie_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      movie_type TEXT NOT NULL CHECK(movie_type IN ('movie', 'tv')),
      interaction_type TEXT NOT NULL CHECK(interaction_type IN ('blocked', 'super_liked')),
      title TEXT,
      poster_path TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      UNIQUE(movie_id, movie_type, interaction_type)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_movie_interactions_lookup
     ON movie_interactions(movie_id, movie_type, interaction_type)`,
    `CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )`,
  ],
  2: [
    `CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      movie_type TEXT NOT NULL CHECK(movie_type IN ('movie', 'tv')),
      title TEXT,
      poster_path TEXT,
      session_id TEXT NOT NULL,
      viewed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      UNIQUE(movie_id, session_id)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_matches_session
     ON matches(session_id)`,
    `CREATE INDEX IF NOT EXISTS idx_matches_viewed
     ON matches(viewed)`,
  ],
};

async function getSchemaVersion(db: SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      "SELECT MAX(version) as version FROM schema_version"
    );
    return result?.version ?? 0;
  } catch {
    return 0;
  }
}

async function setSchemaVersion(db: SQLiteDatabase, version: number): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO schema_version (version, applied_at) VALUES (?, strftime('%s', 'now'))",
    [version]
  );
}

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const currentVersion = await getSchemaVersion(db);

  console.log(`[DB Migration] Current version: ${currentVersion}, Target version: ${CURRENT_SCHEMA_VERSION}`);

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    // Safety check: ensure all tables exist even if version says we're up to date
    await ensureTablesExist(db);
    return;
  }

  for (let version = currentVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
    const migrationStatements = migrations[version];
    if (migrationStatements) {
      console.log(`[DB Migration] Running migration ${version}`);
      for (const statement of migrationStatements) {
        try {
          await db.execAsync(statement);
        } catch (error) {
          console.error(`[DB Migration] Failed to execute statement:`, statement, error);
          throw error;
        }
      }
      await setSchemaVersion(db, version);
      console.log(`[DB Migration] Completed migration ${version}`);
    }
  }
}

async function ensureTablesExist(db: SQLiteDatabase): Promise<void> {
  // Run all CREATE TABLE IF NOT EXISTS statements to fix corrupted state
  for (const statements of Object.values(migrations)) {
    for (const statement of statements) {
      if (statement.includes("CREATE TABLE IF NOT EXISTS") || statement.includes("CREATE INDEX IF NOT EXISTS")) {
        try {
          await db.execAsync(statement);
        } catch (error) {
          console.error(`[DB Migration] Failed to ensure table exists:`, error);
        }
      }
    }
  }
}
