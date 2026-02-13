import type { SQLiteDatabase } from "expo-sqlite";
import type { MovieInteraction, MovieInteractionInsert, InteractionType, MovieType } from "../types";

export function createMovieInteractionsRepo(db: SQLiteDatabase) {
  return {
    async add(interaction: MovieInteractionInsert): Promise<void> {
      await db.runAsync(
        `INSERT OR REPLACE INTO movie_interactions
         (movie_id, movie_type, interaction_type, title, poster_path, created_at)
         VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'))`,
        [
          interaction.movie_id,
          interaction.movie_type,
          interaction.interaction_type,
          interaction.title ?? null,
          interaction.poster_path ?? null,
        ],
      );
    },

    async remove(movieId: number, movieType: MovieType, interactionType: InteractionType): Promise<void> {
      await db.runAsync("DELETE FROM movie_interactions WHERE movie_id = ? AND movie_type = ? AND interaction_type = ?", [
        movieId,
        movieType,
        interactionType,
      ]);
    },

    async getByInteractionType(interactionType: InteractionType): Promise<MovieInteraction[]> {
      return db.getAllAsync<MovieInteraction>("SELECT * FROM movie_interactions WHERE interaction_type = ? ORDER BY created_at DESC", [
        interactionType,
      ]);
    },

    async getAll(): Promise<MovieInteraction[]> {
      return db.getAllAsync<MovieInteraction>("SELECT * FROM movie_interactions ORDER BY created_at DESC");
    },

    async exists(movieId: number, movieType: MovieType, interactionType: InteractionType): Promise<boolean> {
      const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM movie_interactions WHERE movie_id = ? AND movie_type = ? AND interaction_type = ?",
        [movieId, movieType, interactionType],
      );
      return (result?.count ?? 0) > 0;
    },

    async getIds(interactionType: InteractionType): Promise<number[]> {
      const results = await db.getAllAsync<{ movie_id: number }>("SELECT movie_id FROM movie_interactions WHERE interaction_type = ?", [
        interactionType,
      ]);
      return results.map((r) => r.movie_id);
    },

    async clearByInteractionType(interactionType: InteractionType): Promise<void> {
      await db.runAsync("DELETE FROM movie_interactions WHERE interaction_type = ?", [interactionType]);
    },

    async clearAll(): Promise<void> {
      await db.runAsync("DELETE FROM movie_interactions");
    },

    async isSuperLiked(movieId: number, movieType: MovieType): Promise<boolean> {
      return db
        .runAsync("SELECT movie_id FROM movie_interactions WHERE movie_id = ? AND movie_type = ? AND interaction_type = ?", [
          movieId,
          movieType,
          "super_liked",
        ])
        .then((result) => !!result);
    },
  };
}

export type MovieInteractionsRepo = ReturnType<typeof createMovieInteractionsRepo>;
