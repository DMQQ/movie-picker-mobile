import * as SQLite from "expo-sqlite";
import { migrateDatabase } from "./schema";

const DATABASE_NAME = "flickmate.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

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
