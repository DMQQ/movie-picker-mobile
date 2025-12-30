import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
};

export const roomBuilderSlice = createSlice({
  name: "roomBuilder",
  initialState,
  reducers: {
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = Math.max(1, Math.min(5, action.payload));
    },
    goBack: (state) => {
      state.currentStep = Math.max(1, state.currentStep - 1);
    },
    goNext: (state) => {
      state.currentStep = Math.min(5, state.currentStep + 1);
    },
    setCategory: (state, action: PayloadAction<{ id: string; path: string; type: "movie" | "tv" }>) => {
      state.category = action.payload.path;
      state.categoryId = action.payload.id;
      // Reset genres when changing category type
      if (state.gameType !== action.payload.type) {
        state.genres = [];
      }
      state.gameType = action.payload.type;
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
    setMaxRounds: (state, action: PayloadAction<number>) => {
      state.maxRounds = action.payload;
    },
    setCacheKey: (state, action: PayloadAction<string>) => {
      state.cacheKey = action.payload;
    },
    reset: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { goToStep, goBack, goNext, setCategory, toggleGenre, setProviders, toggleSpecialCategory, setMaxRounds, setCacheKey, reset } =
  roomBuilderSlice.actions;

export default roomBuilderSlice.reducer;
