// src/screens/Room/RoomSetup/roomSetup.config.ts

import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// --- HELPERS ---

const getFormattedDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
};

// --- CATEGORY DEFINITIONS ---

export const getMovieCategories = (t: (key: string) => string) => [
  { label: t("room.genres.all_movies"), path: "/discover/movie?sort_by=popularity.desc&vote_count.gte=100" },
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
    component: FontAwesome5,
    name: "play-circle",
    color: "#4ECDC4",
  },
  "/discover/movie?sort_by=popularity.desc&vote_count.gte=200": { component: FontAwesome5, name: "fire", color: "#FFD23F" },
  "/discover/movie?sort_by=vote_average.desc&vote_count.gte=300": { component: FontAwesome, name: "star", color: "#FF8C69" },
  "/movie/upcoming": { component: FontAwesome5, name: "calendar-alt", color: "#8B4513" },
  "/discover/tv?sort_by=popularity.desc&vote_count.gte=100": { component: FontAwesome5, name: "tv", color: "#9370DB" },
  "/discover/tv?sort_by=vote_average.desc&vote_count.gte=300": { component: FontAwesome5, name: "star-of-life", color: "#32CD32" },
  "/discover/tv?sort_by=popularity.desc&vote_count.gte=200": { component: FontAwesome5, name: "chart-line", color: "#DA70D6" },
  [`/discover/tv?air_date.gte=${getFormattedDate()}&air_date.lte=${getFormattedDate()}&sort_by=popularity.desc`]: {
    component: FontAwesome5,
    name: "broadcast-tower",
    color: "#CD853F",
  },
  [`/tv/airing_today?first_air_date.gte=${getFormattedDate(-7)}&first_air_date.lte=${getFormattedDate(7)}&sort_by=popularity.desc`]: {
    component: FontAwesome5,
    name: "satellite-dish",
    color: "#2F4F4F",
  },
};

const GENRE_ICON_MAP: IconMap = {
  28: { component: FontAwesome5, name: "fist-raised", color: "#FF6B35" },
  10759: { component: FontAwesome5, name: "running", color: "#FF6B35" },
  12: { component: FontAwesome5, name: "hiking", color: "#4ECDC4" },
  16: { component: FontAwesome5, name: "film", color: "#FFD23F" },
  35: { component: FontAwesome5, name: "smile-beam", color: "#FF8C69" },
  80: { component: FontAwesome5, name: "fingerprint", color: "#8B4513" },
  99: { component: FontAwesome5, name: "newspaper", color: "#708090" },
  18: { component: FontAwesome5, name: "sad-cry", color: "#9370DB" },
  10751: { component: FontAwesome5, name: "baby", color: "#32CD32" },
  // ... add all other genre icons here
  37: { component: FontAwesome5, name: "horse", color: "#D2691E" },
};

const DEFAULT_ICON = { component: MaterialIcons, name: "local-offer", color: "#808080" };

export const getCategoryIcon = (path: string) => CATEGORY_ICON_MAP[path] || DEFAULT_ICON;
export const getGenreIcon = (genreId: number) => GENRE_ICON_MAP[genreId] || DEFAULT_ICON;
