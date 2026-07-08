import { AsyncStorage } from "expo-sqlite/kv-store";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { useMigrateListsMutation, type MigrateBody } from "../redux/lists/listsApi";
import { STORAGE_KEY } from "../redux/favourites/favourites";
import { useMovieInteractions } from "../context/DatabaseContext";
import {
  clearAllBlocked,
  clearAllSuperLiked,
} from "../redux/movieInteractions/movieInteractionsSlice";
import { toSlug } from "../utils/utilities";

const GROUP_NAME_TO_TYPE: Record<string, string> = {
  Favorites: "favourites",
  Watchlist: "watchlist",
  Watched: "watched",
};

export function useMigrateLibrary() {
  const dispatch = useAppDispatch();
  const { movieInteractions } = useMovieInteractions();

  // Interactions come from SQLite-backed Redux state (hydrated before sign-in)
  const superLiked = useAppSelector((s) => s.movieInteractions.superLiked);
  const blocked = useAppSelector((s) => s.movieInteractions.blocked);

  const [migrate, result] = useMigrateListsMutation();

  async function migrateLibrary() {
    // Read groups directly from AsyncStorage so this works even after the API
    // has already overwritten state.favourite.groups post sign-in.
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const localGroups: Array<{ name: string; movies: Array<{ id: number; type: string; imageUrl: string }> }> =
      raw ? JSON.parse(raw).groups ?? [] : [];

    const body: MigrateBody = {
      groups: localGroups.map((g) => ({
        name: g.name,
        type: GROUP_NAME_TO_TYPE[g.name] ?? toSlug(g.name),
        movies: g.movies.map((m) => ({
          id: m.id,
          type: m.type as "movie" | "tv",
          imageUrl: m.imageUrl,
        })),
      })),
      interactions: [
        ...superLiked.map((m) => ({
          movieId: m.movie_id,
          movieType: m.movie_type,
          interactionType: "super_liked" as const,
          title: m.title ?? "",
          posterPath: m.poster_path ?? "",
        })),
        ...blocked.map((m) => ({
          movieId: m.movie_id,
          movieType: m.movie_type,
          interactionType: "blocked" as const,
          title: m.title ?? "",
          posterPath: m.poster_path ?? "",
        })),
      ],
      matches: [],
    };

    const migrationResult = await migrate(body).unwrap();

    // Clear local storage so data isn't re-migrated or shown as "pending"
    await AsyncStorage.removeItem(STORAGE_KEY);
    if (movieInteractions) {
      await Promise.all([
        dispatch(clearAllSuperLiked(movieInteractions)),
        dispatch(clearAllBlocked(movieInteractions)),
      ]);
    }

    return migrationResult;
  }

  // Count of local items available to migrate
  async function getLocalDataCount(): Promise<{ movies: number; interactions: number }> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const localGroups: Array<{ movies: any[] }> = raw ? JSON.parse(raw).groups ?? [] : [];
    const movies = localGroups.reduce((sum, g) => sum + (g.movies?.length ?? 0), 0);
    const interactions = superLiked.length + blocked.length;
    return { movies, interactions };
  }

  return { migrateLibrary, getLocalDataCount, ...result };
}
