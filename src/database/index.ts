import * as SQLite from "expo-sqlite";
import { File, Directory, Paths } from "expo-file-system/next";
import { migrateDatabase } from "./schema";

const DATABASE_NAME = "flickmate.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;

function ensureSQLiteDirectory(): void {
  const sqlitePath = `${Paths.document.uri}/SQLite`;
  const asFile = new File(sqlitePath);
  const asDir = new Directory(sqlitePath);

  // If something exists as a file (not directory), delete it
  if (asFile.exists && !asDir.exists) {
    console.log("[DB] Removing conflicting file at SQLite path");
    asFile.delete();
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  ensureSQLiteDirectory();

  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await migrateDatabase(dbInstance);

  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

export { dbInstance };
