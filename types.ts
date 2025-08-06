export interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  name?: string;

  video: boolean;
  vote_average: number;
  vote_count: number;

  first_air_date?: string;

  genres?: string[];

  type?: "movie" | "tv";

  original_name?: string;

  placeholder_poster_path?: string;
}

export interface TVShow {}

export type MovieDetails = Movie & {
  adult: boolean;
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  popularity: number;
  production_companies: {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string;
  }[];
  production_countries: { iso_3166_1: string; name: string }[];
  revenue: number;
  runtime: number;

  spoken_languages: { english_name: string; iso_639_1: string }[];
  status: string;
  tagline: string;
  video: boolean;
  vote_count: number;
  backdrop_path: string;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
};

export interface Episode {
  air_date: string;
  crew: any[];

  episode_number: number;

  episode_type: string;

  guest_stars: any[];

  id: number;

  name: string;
  overview: string;

  production_code: string;

  runtime: number;

  season_number: 1;

  show_id: number;

  still_path: string;

  vote_average: number;

  vote_count: number;
}
