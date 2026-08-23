import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PickedMovie {
  id: number;
  title: string;
  poster_path: string;
  contentType?: "movie" | "tv";
}

interface MoviePickerState {
  selected: PickedMovie[];
  confirmed: boolean;
}

const initialState: MoviePickerState = {
  selected: [],
  confirmed: false,
};

const moviePickerSlice = createSlice({
  name: "moviePicker",
  initialState,
  reducers: {
    init(state, action: PayloadAction<{ initial?: PickedMovie[] }>) {
      state.selected = action.payload.initial ?? [];
      state.confirmed = false;
    },
    toggle(state, action: PayloadAction<PickedMovie>) {
      const movie = action.payload;
      const idx = state.selected.findIndex((m) => m.id === movie.id);
      if (idx >= 0) {
        state.selected.splice(idx, 1);
      } else {
        state.selected.push(movie);
      }
    },
    addMany(state, action: PayloadAction<PickedMovie[]>) {
      const existing = new Set(state.selected.map((m) => m.id));
      for (const movie of action.payload) {
        if (!existing.has(movie.id)) {
          state.selected.push(movie);
          existing.add(movie.id);
        }
      }
    },
    removeMany(state, action: PayloadAction<number[]>) {
      const ids = new Set(action.payload);
      state.selected = state.selected.filter((m) => !ids.has(m.id));
    },
    confirm(state) {
      state.confirmed = true;
    },
    clearConfirmed(state) {
      state.confirmed = false;
    },
  },
});

export const moviePickerActions = moviePickerSlice.actions;
export default moviePickerSlice.reducer;
