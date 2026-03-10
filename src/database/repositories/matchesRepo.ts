import type { SQLiteDatabase } from "expo-sqlite";
import type { StoredMatch, StoredMatchInsert } from "../types";

export function createMatchesRepo(db: SQLiteDatabase) {
  return {
    async add(match: StoredMatchInsert): Promise<void> {
      await db.runAsync(
        `INSERT OR REPLACE INTO matches
         (movie_id, movie_type, title, poster_path, session_id, viewed, created_at)
         VALUES (?, ?, ?, ?, ?, 0, strftime('%s', 'now'))`,
        [match.movie_id, match.movie_type, match.title ?? null, match.poster_path ?? null, match.session_id],
      );
    },

    async getBySession(sessionId: string): Promise<StoredMatch[]> {
      return db.getAllAsync<StoredMatch>("SELECT * FROM matches WHERE session_id = ? ORDER BY created_at DESC", [
        sessionId,
      ]);
    },

    async getAll(): Promise<StoredMatch[]> {
      return db.getAllAsync<StoredMatch>("SELECT * FROM matches ORDER BY created_at DESC");
    },

    async getUnviewed(): Promise<StoredMatch[]> {
      return db.getAllAsync<StoredMatch>("SELECT * FROM matches WHERE viewed = 0 ORDER BY created_at DESC");
    },

    async hasUnviewedMatches(): Promise<boolean> {
      const result = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM matches WHERE viewed = 0");
      return (result?.count ?? 0) > 0;
    },

    async getUnviewedCount(): Promise<number> {
      const result = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM matches WHERE viewed = 0");
      return result?.count ?? 0;
    },

    async markSessionViewed(sessionId: string): Promise<void> {
      await db.runAsync("UPDATE matches SET viewed = 1 WHERE session_id = ?", [sessionId]);
    },

    async markAllViewed(): Promise<void> {
      await db.runAsync("UPDATE matches SET viewed = 1");
    },

    async clearSession(sessionId: string): Promise<void> {
      await db.runAsync("DELETE FROM matches WHERE session_id = ?", [sessionId]);
    },

    async clearAll(): Promise<void> {
      await db.runAsync("DELETE FROM matches");
    },
  };
}

export type MatchesRepo = ReturnType<typeof createMatchesRepo>;
