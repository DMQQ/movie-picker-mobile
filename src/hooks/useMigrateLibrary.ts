import { useAppSelector } from "../redux/store";
import { useMigrateListsMutation, type MigrateBody } from "../redux/lists/listsApi";

const GROUP_NAME_TO_TYPE: Record<string, string> = {
  Favorites: "favourites",
  Watchlist: "watchlist",
  Watched: "watched",
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function useMigrateLibrary() {
  const groups = useAppSelector((s) => s.favourite.groups);
  const superLiked = useAppSelector((s) => s.movieInteractions.superLiked);
  const blocked = useAppSelector((s) => s.movieInteractions.blocked);

  const [migrate, result] = useMigrateListsMutation();

  async function migrateLibrary() {
    const body: MigrateBody = {
      groups: groups.map((g) => ({
        name: g.name,
        type: GROUP_NAME_TO_TYPE[g.name] ?? toSlug(g.name),
        movies: g.movies.map((m) => ({
          id: m.id,
          type: m.type,
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

    return migrate(body).unwrap();
  }

  return { migrateLibrary, ...result };
}
