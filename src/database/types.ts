export type MovieType = "movie" | "tv";
export type InteractionType = "blocked" | "super_liked";

export interface MovieInteraction {
  id: number;
  movie_id: number;
  movie_type: MovieType;
  interaction_type: InteractionType;
  title: string | null;
  poster_path: string | null;
  created_at: number;
}

export interface MovieInteractionInsert {
  movie_id: number;
  movie_type: MovieType;
  interaction_type: InteractionType;
  title?: string | null;
  poster_path?: string | null;
}
