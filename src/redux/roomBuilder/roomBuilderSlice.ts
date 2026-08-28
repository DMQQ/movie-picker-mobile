import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PickedMovie } from "../moviePicker/moviePickerSlice";

interface Genre {
  id: number;
  name: string;
}

interface RoomBuilderState {
  currentStep: number;
  gameType: "movie" | "tv";
  category: string;
  categoryId: string;
  genres: Genre[];
  providers: number[];
  specialCategories: string[];
  maxRounds: number;
  cacheKey: string | null;
  quickStartMode: boolean;
  customMovies: PickedMovie[];
}

const initialState: RoomBuilderState = {
  currentStep: 1,
  gameType: "movie",
  category: "",
  categoryId: "",
  genres: [],
  providers: [],
  specialCategories: [],
  maxRounds: 3,
  cacheKey: null,
  quickStartMode: false,
  customMovies: [],
};

export const roomBuilderSlice = createSlice({
  name: "roomBuilder",
  initialState,
  reducers: {
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = Math.max(1, Math.min(4, action.payload));
    },
    goBack: (state) => {
      state.currentStep = Math.max(1, state.currentStep - 1);
    },
    goNext: (state) => {
      state.currentStep = Math.min(4, state.currentStep + 1);
    },
    setCategory: (state, action: PayloadAction<{ id: string; path: string; type: "movie" | "tv" }>) => {
      state.category = action.payload.path;
      state.categoryId = action.payload.id;
      if (state.gameType !== action.payload.type) {
        state.genres = [];
      }
      state.gameType = action.payload.type;
      state.customMovies = [];
    },
    setCustomMovies: (state, action: PayloadAction<PickedMovie[]>) => {
      state.customMovies = action.payload;
      state.category = "";
      state.categoryId = "";
    },
    toggleGenre: (state, action: PayloadAction<Genre>) => {
      const genreExists = state.genres.some((g) => g.id === action.payload.id);
      if (genreExists) {
        state.genres = state.genres.filter((g) => g.id !== action.payload.id);
      } else {
        state.genres.push(action.payload);
      }
    },
    setProviders: (state, action: PayloadAction<number[]>) => {
      state.providers = action.payload;
    },
    toggleSpecialCategory: (state, action: PayloadAction<string>) => {
      const categoryExists = state.specialCategories.includes(action.payload);
      if (categoryExists) {
        state.specialCategories = state.specialCategories.filter((cat) => cat !== action.payload);
      } else {
        state.specialCategories.push(action.payload);
      }
    },
    setCacheKey: (state, action: PayloadAction<string>) => {
      state.cacheKey = action.payload;
    },
    setQuickStartMode: (state, action: PayloadAction<boolean>) => {
      state.quickStartMode = action.payload;
    },
    reset: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { goToStep, goBack, goNext, setCategory, setCustomMovies, toggleGenre, setProviders, toggleSpecialCategory, setCacheKey, setQuickStartMode, reset } =
  roomBuilderSlice.actions;
