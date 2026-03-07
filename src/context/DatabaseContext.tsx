import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "../database";
import { createMovieInteractionsRepo, type MovieInteractionsRepo } from "../database/repositories/movieInteractionsRepo";
import { createMatchesRepo, type MatchesRepo } from "../database/repositories/matchesRepo";

interface DatabaseContextValue {
  db: SQLiteDatabase | null;
  movieInteractions: MovieInteractionsRepo | null;
  matches: MatchesRepo | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  movieInteractions: null,
  matches: null,
  isReady: false,
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [movieInteractions, setMovieInteractions] = useState<MovieInteractionsRepo | null>(null);
  const [matches, setMatches] = useState<MatchesRepo | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initDatabase() {
      try {
        const database = await getDatabase();
        if (mounted) {
          setDb(database);
          setMovieInteractions(createMovieInteractionsRepo(database));
          setMatches(createMatchesRepo(database));
          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    }

    initDatabase();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, movieInteractions, matches, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}

export function useMovieInteractions() {
  const { movieInteractions, isReady } = useDatabase();
  return { movieInteractions, isReady };
}

export function useMatches() {
  const { matches, isReady } = useDatabase();
  return { matches, isReady };
}
