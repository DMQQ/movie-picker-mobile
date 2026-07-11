// src/screens/Room/RoomSetup/roomSetup.config.ts

import { MaterialCommunityIcons } from "@expo/vector-icons";

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
    path: `/discover/movie?primary_release_date.gte=${getFormattedDate(-60)}&primary_release_date.lte=${getFormattedDate(
      60,
    )}&sort_by=release_date.desc`,
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
  "/discover/movie?sort_by=popularity.desc&vote_count.gte=100": { component: MaterialCommunityIcons, name: "movie", color: "#FF6B35" },
  [`/discover/movie?primary_release_date.gte=${getFormattedDate(
    -30,
  )}&primary_release_date.lte=${getFormattedDate()}&sort_by=release_date.desc`]: {
    component: MaterialCommunityIcons,
    name: "play",
    color: "#4ECDC4",
  },
  "/discover/movie?sort_by=popularity.desc&vote_count.gte=200": { component: MaterialCommunityIcons, name: "fire", color: "#FFD23F" },
  "/discover/movie?sort_by=vote_average.desc&vote_count.gte=300": { component: MaterialCommunityIcons, name: "star", color: "#FF8C69" },
  "/movie/upcoming": { component: MaterialCommunityIcons, name: "clock-outline", color: "#8B4513" },
  "/discover/tv?sort_by=popularity.desc&vote_count.gte=100": { component: MaterialCommunityIcons, name: "television", color: "#9370DB" },
  "/discover/tv?sort_by=vote_average.desc&vote_count.gte=300": { component: MaterialCommunityIcons, name: "star", color: "#32CD32" },
  "/discover/tv?sort_by=popularity.desc&vote_count.gte=200": { component: MaterialCommunityIcons, name: "trending-up", color: "#DA70D6" },
  [`/discover/tv?air_date.gte=${getFormattedDate()}&air_date.lte=${getFormattedDate()}&sort_by=popularity.desc`]: {
    component: MaterialCommunityIcons,
    name: "television-play",
    color: "#CD853F",
  },
  [`/tv/airing_today?first_air_date.gte=${getFormattedDate(-7)}&first_air_date.lte=${getFormattedDate(7)}&sort_by=popularity.desc`]: {
    component: MaterialCommunityIcons,
    name: "satellite-variant",
    color: "#2F4F4F",
  },
};

const GENRE_ICON_MAP: IconMap = {
  28: { component: MaterialCommunityIcons, name: "karate", color: "#FF6B35" }, // Action
  10759: { component: MaterialCommunityIcons, name: "run", color: "#FF6B35" }, // Action & Adventure
  12: { component: MaterialCommunityIcons, name: "image-filter-hdr", color: "#4ECDC4" }, // Adventure
  16: { component: MaterialCommunityIcons, name: "animation", color: "#FFD23F" }, // Animation
  35: { component: MaterialCommunityIcons, name: "emoticon-excited-outline", color: "#FF8C69" }, // Comedy
  80: { component: MaterialCommunityIcons, name: "shield-lock", color: "#8B4513" }, // Crime
  99: { component: MaterialCommunityIcons, name: "newspaper-variant-outline", color: "#708090" }, // Documentary
  18: { component: MaterialCommunityIcons, name: "emoticon-sad-outline", color: "#9370DB" }, // Drama
  10751: { component: MaterialCommunityIcons, name: "human-male-female-child", color: "#32CD32" }, // Family
  14: { component: MaterialCommunityIcons, name: "auto-fix", color: "#DA70D6" }, // Fantasy
  36: { component: MaterialCommunityIcons, name: "bank", color: "#CD853F" }, // History
  27: { component: MaterialCommunityIcons, name: "weather-night", color: "#8B0000" }, // Horror
  10402: { component: MaterialCommunityIcons, name: "music-note", color: "#FF1493" }, // Music
  9648: { component: MaterialCommunityIcons, name: "magnify", color: "#4B0082" }, // Mystery
  10749: { component: MaterialCommunityIcons, name: "heart", color: "#FF69B4" }, // Romance
  878: { component: MaterialCommunityIcons, name: "rocket-launch", color: "#00CED1" }, // Science Fiction
  10770: { component: MaterialCommunityIcons, name: "television", color: "#696969" }, // TV Movie
  53: { component: MaterialCommunityIcons, name: "alert", color: "#DC143C" }, // Thriller
  10752: { component: MaterialCommunityIcons, name: "shield", color: "#8B4513" }, // War
  37: { component: MaterialCommunityIcons, name: "tractor", color: "#D2691E" }, // Western

  // TV-specific genres
  10762: { component: MaterialCommunityIcons, name: "baby-face-outline", color: "#FFB6C1" }, // Kids
  10763: { component: MaterialCommunityIcons, name: "newspaper", color: "#2F4F4F" }, // News
  10764: { component: MaterialCommunityIcons, name: "camera", color: "#FF7F50" }, // Reality
  10765: { component: MaterialCommunityIcons, name: "rocket-launch", color: "#6A5ACD" }, // Sci-Fi & Fantasy
  10766: { component: MaterialCommunityIcons, name: "drama-masks", color: "#DDA0DD" }, // Soap
  10767: { component: MaterialCommunityIcons, name: "microphone", color: "#20B2AA" }, // Talk
  10768: { component: MaterialCommunityIcons, name: "gavel", color: "#B22222" }, // War & Politics
};

const DEFAULT_ICON = { component: MaterialCommunityIcons, name: "tag", color: "#808080" };

export const getCategoryIcon = (path: string) => CATEGORY_ICON_MAP[path] || DEFAULT_ICON;
export const getGenreIcon = (genreId: number) => GENRE_ICON_MAP[genreId] || DEFAULT_ICON;
