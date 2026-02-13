import type { SQLiteDatabase } from "expo-sqlite";

const CURRENT_SCHEMA_VERSION = 1;

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

  if (currentVersion >= CURRENT_SCHEMA_VERSION) {
    return;
  }

  for (let version = currentVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
    const migrationStatements = migrations[version];
    if (migrationStatements) {
      for (const statement of migrationStatements) {
        await db.execAsync(statement);
      }
      await setSchemaVersion(db, version);
    }
  }
}
