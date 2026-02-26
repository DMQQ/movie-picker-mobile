import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { setProviders, toggleProvider, clearAllFilters } from "./mediaFilters/mediaFiltersSlice";
import { saveFilterPreferences, clearFilterPreferences } from "./filterPreferences/filterPreferencesSlice";

export const listenerMiddleware = createListenerMiddleware();

// Auto-save providers to storage when they change in mediaFilters
listenerMiddleware.startListening({
  matcher: isAnyOf(setProviders, toggleProvider),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as { mediaFilters: { selectedProviders: number[] } };
    const providers = state.mediaFilters.selectedProviders;

    // Save to storage via the async thunk
    listenerApi.dispatch(saveFilterPreferences({ providers }));
  },
});

// Clear storage when filters are cleared
listenerMiddleware.startListening({
  actionCreator: clearAllFilters,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(clearFilterPreferences());
  },
});
