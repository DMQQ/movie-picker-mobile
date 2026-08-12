import * as SQLite from "expo-sqlite";
import { File, Directory, Paths } from "expo-file-system";
import * as Sentry from "@sentry/react-native";
import { migrateDatabase } from "./schema";

const DATABASE_NAME = "flickmate.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;
let openPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let reopenPromise: Promise<void> | null = null;

function ensureSQLiteDirectory(): void {
  const sqlitePath = `${Paths.document.uri}/SQLite`;
  const asFile = new File(sqlitePath);
  const asDir = new Directory(sqlitePath);

  // If something exists as a file (not directory), delete it
  if (asFile.exists && !asDir.exists) {
    console.log("[DB] Removing conflicting file at SQLite path");
    asFile.delete();
  }

  // Ensure the SQLite directory exists
  if (!asDir.exists) {
    console.log("[DB] Creating SQLite directory");
    asDir.create();
  }
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  ensureSQLiteDirectory();
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await migrateDatabase(db);
  return db;
}

function isReleasedError(e: unknown): boolean {
  const msg = (e as Error)?.message ?? "";
  const cause = (e as any)?.cause?.message ?? "";
  return (
    msg.includes("released") ||
    cause.includes("released") ||
    msg.includes("Cannot use shared object")
  );
}

// Wrapped async methods that hit the native db and may fail after Android activity teardown.
const WRAPPED_METHODS = [
  "runAsync",
  "getAllAsync",
  "getFirstAsync",
  "execAsync",
  "prepareAsync",
];

function createResilientDatabase(
  initialDb: SQLite.SQLiteDatabase,
): SQLite.SQLiteDatabase {
  let currentDb = initialDb;

  async function reopen(): Promise<void> {
    if (reopenPromise) return reopenPromise;

    reopenPromise = (async () => {
      console.log("[DB] Native object released, reconnecting…");
      try {
        await currentDb.closeAsync();
      } catch (error) {
        Sentry.captureException(error, { tags: { context: "db_close" } });
      }
      currentDb = await openAndMigrate();
      dbInstance = currentDb;
    })()
      .finally(() => {
        reopenPromise = null;
      });

    return reopenPromise;
  }

  return new Proxy(currentDb, {
    get(_, prop) {
      const value = Reflect.get(currentDb, prop);

      if (
        typeof value === "function" &&
        WRAPPED_METHODS.includes(prop as string)
      ) {
        return async (...args: any[]) => {
          try {
            return await (value as Function).apply(currentDb, args);
          } catch (e: unknown) {
            if (isReleasedError(e)) {
              await reopen();
              const newFn = Reflect.get(
                currentDb,
                prop,
              ) as Function;
              return await newFn.apply(currentDb, args);
            }
            Sentry.captureException(e, {
              tags: { context: "db_query", method: String(prop) },
            });
            throw e;
          }
        };
      }

      return value;
    },
  }) as SQLite.SQLiteDatabase;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  if (!openPromise) {
    openPromise = openAndMigrate()
      .then((db) => {
        dbInstance = createResilientDatabase(db);
        return dbInstance;
      })
      .catch((err) => {
        openPromise = null;
        throw err;
      });
  }

  return openPromise;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}

export { dbInstance };
