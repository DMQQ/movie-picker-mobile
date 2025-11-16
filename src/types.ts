import { Movie } from "../types";

export type SectionData =
  | { name: string; results: Movie[] }
  | { name: string; results: Movie[]; type: "game"; gameType: "quick" | "social" | "voter" | "fortune" | "all-games" };
