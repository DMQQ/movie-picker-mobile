import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Genre {
  id: number;
  name: string;
}

export type DecadeFilter = "all" | "90s" | "2000s" | "2010s" | "2020s";

interface MediaFiltersState {
  mediaType: "movie" | "tv" | "both";
  selectedProviders: number[];
  selectedGenres: Genre[];
  selectedDecade: DecadeFilter;
  isFilterActive: boolean;
}

const initialState: MediaFiltersState = {
  mediaType: "both",
  selectedProviders: [],
  selectedGenres: [],
  selectedDecade: "all",
  isFilterActive: false,
};

const computeIsFilterActive = (state: MediaFiltersState): boolean => {
  return (
    state.mediaType !== "both" ||
    state.selectedProviders.length > 0 ||
    state.selectedGenres.length > 0 ||
    state.selectedDecade !== "all"
  );
};

export const mediaFiltersSlice = createSlice({
  name: "mediaFilters",
  initialState,
  reducers: {
    setMediaType: (state, action: PayloadAction<"movie" | "tv" | "both">) => {
      state.mediaType = action.payload;
      // Reset genres when changing type since genres are type-specific
      if (action.payload !== "both") {
        state.selectedGenres = [];
      }
      state.isFilterActive = computeIsFilterActive(state);
    },
    setProviders: (state, action: PayloadAction<number[]>) => {
      state.selectedProviders = action.payload;
      state.isFilterActive = computeIsFilterActive(state);
    },
    toggleProvider: (state, action: PayloadAction<number>) => {
      const providerId = action.payload;
      const index = state.selectedProviders.indexOf(providerId);
      if (index > -1) {
        state.selectedProviders.splice(index, 1);
      } else {
        state.selectedProviders.push(providerId);
      }
      state.isFilterActive = computeIsFilterActive(state);
    },
    toggleGenre: (state, action: PayloadAction<Genre>) => {
      const genreExists = state.selectedGenres.some((g) => g.id === action.payload.id);
      if (genreExists) {
        state.selectedGenres = state.selectedGenres.filter((g) => g.id !== action.payload.id);
      } else {
        state.selectedGenres.push(action.payload);
      }
      state.isFilterActive = computeIsFilterActive(state);
    },
    setGenres: (state, action: PayloadAction<Genre[]>) => {
      state.selectedGenres = action.payload;
      state.isFilterActive = computeIsFilterActive(state);
    },
    setDecade: (state, action: PayloadAction<DecadeFilter>) => {
      state.selectedDecade = action.payload;
      state.isFilterActive = computeIsFilterActive(state);
    },
    clearAllFilters: (state) => {
      state.mediaType = "both";
      state.selectedProviders = [];
      state.selectedGenres = [];
      state.selectedDecade = "all";
      state.isFilterActive = false;
    },
  },
});

export const { setMediaType, setProviders, toggleProvider, toggleGenre, setGenres, setDecade, clearAllFilters } =
  mediaFiltersSlice.actions;

export default mediaFiltersSlice.reducer;
