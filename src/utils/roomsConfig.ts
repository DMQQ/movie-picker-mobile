// src/screens/Room/RoomSetup/roomSetup.config.ts

import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// --- HELPERS ---

const getFormattedDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
};

// --- CATEGORY DEFINITIONS ---

export const getMovieCategories = (t: (key: string) => string) => [
  { label: t("room.genres.all_movies"), path: "/discover/movie?sort_by=popularity.desc&vote_count.gte=300" },
  { label: t("room.genres.popular"), path: "/discover/movie?sort_by=popularity.desc&vote_count.gte=200" },
  { label: t("room.genres.top_rated"), path: "/discover/movie?sort_by=vote_average.desc&vote_count.gte=300" },
  { label: t("room.genres.upcoming"), path: "/movie/upcoming" },
  {
    label: t("room.genres.now_playing"),
    path: `/discover/movie?primary_release_date.gte=${getFormattedDate(
      -60
    )}&primary_release_date.lte=${getFormattedDate()}&sort_by=release_date.desc`,
  },
];

export const getSeriesCategories = (t: (key: string) => string) => [
  { label: t("room.genres.all_tv"), path: "/discover/tv?sort_by=popularity.desc&vote_count.gte=100" },
  { label: t("room.genres.top_rated_tv"), path: "/discover/tv?sort_by=vote_average.desc&vote_count.gte=300" },
  { label: t("room.genres.popular_tv"), path: "/discover/tv?sort_by=popularity.desc&vote_count.gte=200" },
  {
    label: t("room.genres.airing_today"),
    path: `/discover/tv?air_date.gte=${getFormattedDate()}&air_date.lte=${getFormattedDate()}&sort_by=popularity.desc`,
  },
  {
    label: t("room.genres.on_the_air"),
    path: `/tv/airing_today?first_air_date.gte=${getFormattedDate(-7)}&first_air_date.lte=${getFormattedDate(7)}&sort_by=popularity.desc`,
  },
];

// --- ICON MAPPINGS ---

type IconMap = { [key: string | number]: { component: any; name: string; color: string } };

const CATEGORY_ICON_MAP: IconMap = {
  "/discover/movie?sort_by=popularity.desc&vote_count.gte=100": { component: MaterialIcons, name: "movie", color: "#FF6B35" },
  [`/discover/movie?primary_release_date.gte=${getFormattedDate(
    -30
  )}&primary_release_date.lte=${getFormattedDate()}&sort_by=release_date.desc`]: {
    component: MaterialIcons,
    name: "play-arrow",
    color: "#4ECDC4",
  },
  "/discover/movie?sort_by=popularity.desc&vote_count.gte=200": { component: MaterialIcons, name: "whatshot", color: "#FFD23F" },
  "/discover/movie?sort_by=vote_average.desc&vote_count.gte=300": { component: MaterialIcons, name: "star", color: "#FF8C69" },
  "/movie/upcoming": { component: MaterialIcons, name: "schedule", color: "#8B4513" },
  "/discover/tv?sort_by=popularity.desc&vote_count.gte=100": { component: MaterialIcons, name: "tv", color: "#9370DB" },
  "/discover/tv?sort_by=vote_average.desc&vote_count.gte=300": { component: MaterialIcons, name: "star", color: "#32CD32" },
  "/discover/tv?sort_by=popularity.desc&vote_count.gte=200": { component: MaterialIcons, name: "trending-up", color: "#DA70D6" },
  [`/discover/tv?air_date.gte=${getFormattedDate()}&air_date.lte=${getFormattedDate()}&sort_by=popularity.desc`]: {
    component: MaterialIcons,
    name: "live-tv",
    color: "#CD853F",
  },
  [`/tv/airing_today?first_air_date.gte=${getFormattedDate(-7)}&first_air_date.lte=${getFormattedDate(7)}&sort_by=popularity.desc`]: {
    component: MaterialIcons,
    name: "satellite",
    color: "#2F4F4F",
  },
};

const GENRE_ICON_MAP: IconMap = {
  28: { component: MaterialIcons, name: "sports-martial-arts", color: "#FF6B35" }, // Action
  10759: { component: MaterialIcons, name: "directions-run", color: "#FF6B35" }, // Action & Adventure
  12: { component: MaterialIcons, name: "terrain", color: "#4ECDC4" }, // Adventure
  16: { component: MaterialIcons, name: "animation", color: "#FFD23F" }, // Animation
  35: { component: MaterialIcons, name: "sentiment-very-satisfied", color: "#FF8C69" }, // Comedy
  80: { component: MaterialIcons, name: "security", color: "#8B4513" }, // Crime
  99: { component: MaterialIcons, name: "article", color: "#708090" }, // Documentary
  18: { component: MaterialIcons, name: "sentiment-very-dissatisfied", color: "#9370DB" }, // Drama
  10751: { component: MaterialIcons, name: "family-restroom", color: "#32CD32" }, // Family
  14: { component: MaterialIcons, name: "auto-fix-high", color: "#DA70D6" }, // Fantasy
  36: { component: MaterialIcons, name: "account-balance", color: "#CD853F" }, // History
  27: { component: MaterialIcons, name: "dark-mode", color: "#8B0000" }, // Horror
  10402: { component: MaterialIcons, name: "music-note", color: "#FF1493" }, // Music
  9648: { component: MaterialIcons, name: "search", color: "#4B0082" }, // Mystery
  10749: { component: MaterialIcons, name: "favorite", color: "#FF69B4" }, // Romance
  878: { component: MaterialIcons, name: "rocket-launch", color: "#00CED1" }, // Science Fiction
  10770: { component: MaterialIcons, name: "tv", color: "#696969" }, // TV Movie
  53: { component: MaterialIcons, name: "warning", color: "#DC143C" }, // Thriller
  10752: { component: MaterialIcons, name: "shield", color: "#8B4513" }, // War
  37: { component: MaterialIcons, name: "agriculture", color: "#D2691E" }, // Western

  // TV-specific genres
  10762: { component: MaterialIcons, name: "child-care", color: "#FFB6C1" }, // Kids
  10763: { component: MaterialIcons, name: "newspaper", color: "#2F4F4F" }, // News
  10764: { component: MaterialIcons, name: "camera-alt", color: "#FF7F50" }, // Reality
  10765: { component: MaterialIcons, name: "rocket-launch", color: "#6A5ACD" }, // Sci-Fi & Fantasy
  10766: { component: MaterialIcons, name: "theater-comedy", color: "#DDA0DD" }, // Soap
  10767: { component: MaterialIcons, name: "mic", color: "#20B2AA" }, // Talk
  10768: { component: MaterialIcons, name: "gavel", color: "#B22222" }, // War & Politics
};

const DEFAULT_ICON = { component: MaterialIcons, name: "local-offer", color: "#808080" };

export const getCategoryIcon = (path: string) => CATEGORY_ICON_MAP[path] || DEFAULT_ICON;
export const getGenreIcon = (genreId: number) => GENRE_ICON_MAP[genreId] || DEFAULT_ICON;
