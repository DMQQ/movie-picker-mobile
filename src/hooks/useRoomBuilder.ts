import { useReducer, useCallback } from "react";

interface Genre {
  id: number;
  name: string;
}

interface BuilderState {
  currentStep: number;
  gameType: "movie" | "tv";
  category: string;
  genres: Genre[];
  providers: number[];
  specialCategories: string[];
  maxRounds: number;
  cacheKey: string | null;
}

type BuilderAction =
  | { type: "GO_TO_STEP"; payload: number }
  | { type: "GO_BACK" }
  | { type: "GO_NEXT" }
  | { type: "SET_CATEGORY"; payload: { path: string; type: "movie" | "tv" } }
  | { type: "TOGGLE_GENRE"; payload: Genre }
  | { type: "SET_PROVIDERS"; payload: number[] }
  | { type: "TOGGLE_SPECIAL_CATEGORY"; payload: string }
  | { type: "SET_MAX_ROUNDS"; payload: number }
  | { type: "SET_CACHE_KEY"; payload: string }
  | { type: "RESET" };

const initialState: BuilderState = {
  currentStep: 1,
  gameType: "movie",
  category: "",
  genres: [],
  providers: [],
  specialCategories: [],
  maxRounds: 3,
  cacheKey: null,
};

const builderReducer = (state: BuilderState, action: BuilderAction): BuilderState => {
  switch (action.type) {
    case "GO_TO_STEP":
      return { ...state, currentStep: Math.max(1, Math.min(5, action.payload)) };

    case "GO_BACK":
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) };

    case "GO_NEXT":
      return { ...state, currentStep: Math.min(5, state.currentStep + 1) };

    case "SET_CATEGORY":
      return {
        ...state,
        category: action.payload.path,
        gameType: action.payload.type,
        // Reset genres when changing category type
        genres: state.gameType !== action.payload.type ? [] : state.genres,
      };

    case "TOGGLE_GENRE": {
      const genreExists = state.genres.some((g) => g.id === action.payload.id);
      return {
        ...state,
        genres: genreExists
          ? state.genres.filter((g) => g.id !== action.payload.id)
          : [...state.genres, action.payload],
      };
    }

    case "SET_PROVIDERS":
      return { ...state, providers: action.payload };

    case "TOGGLE_SPECIAL_CATEGORY": {
      const categoryExists = state.specialCategories.includes(action.payload);
      return {
        ...state,
        specialCategories: categoryExists
          ? state.specialCategories.filter((cat) => cat !== action.payload)
          : [...state.specialCategories, action.payload],
      };
    }

    case "SET_MAX_ROUNDS":
      return { ...state, maxRounds: action.payload };

    case "SET_CACHE_KEY":
      return { ...state, cacheKey: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

export const useRoomBuilder = () => {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const actions = {
    goToStep: useCallback((step: number) => {
      dispatch({ type: "GO_TO_STEP", payload: step });
    }, []),

    goBack: useCallback(() => {
      dispatch({ type: "GO_BACK" });
    }, []),

    goNext: useCallback(() => {
      dispatch({ type: "GO_NEXT" });
    }, []),

    setCategory: useCallback((path: string, type: "movie" | "tv") => {
      dispatch({ type: "SET_CATEGORY", payload: { path, type } });
    }, []),

    toggleGenre: useCallback((genre: Genre) => {
      dispatch({ type: "TOGGLE_GENRE", payload: genre });
    }, []),

    setProviders: useCallback((providers: number[]) => {
      dispatch({ type: "SET_PROVIDERS", payload: providers });
    }, []),

    toggleSpecialCategory: useCallback((categoryId: string) => {
      dispatch({ type: "TOGGLE_SPECIAL_CATEGORY", payload: categoryId });
    }, []),

    setMaxRounds: useCallback((rounds: number) => {
      dispatch({ type: "SET_MAX_ROUNDS", payload: rounds });
    }, []),

    setCacheKey: useCallback((cacheKey: string) => {
      dispatch({ type: "SET_CACHE_KEY", payload: cacheKey });
    }, []),

    reset: useCallback(() => {
      dispatch({ type: "RESET" });
    }, []),
  };

  return { state, actions };
};
