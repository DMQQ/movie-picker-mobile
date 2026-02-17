import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Badge, IconButton, MD2DarkTheme } from "react-native-paper";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { setProviders } from "../../redux/mediaFilters/mediaFiltersSlice";
import { useFilterPreferences } from "../../hooks/useFilterPreferences";
import FilterSheet from "./FilterSheet";

export { default as FilterSheet } from "./FilterSheet";
export { default as TypeSelector } from "./TypeSelector";
export { default as DecadeSelector } from "./DecadeSelector";

interface FilterButtonProps {
  size?: number;
  style?: object;
  onApply?: () => void;
  onCategorySelect?: (category: string) => void;
  showCategories?: boolean;
}

export const FilterButton = React.memo(function FilterButton({ size = 24, style, onApply, onCategorySelect, showCategories }: FilterButtonProps) {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const dispatch = useAppDispatch();
  const { preferences: savedProviders } = useFilterPreferences();
  const hasInitialized = useRef(false);

  const isFilterActive = useAppSelector((state) => state.mediaFilters.isFilterActive);
  const mediaType = useAppSelector((state) => state.mediaFilters.mediaType);
  const providersCount = useAppSelector((state) => state.mediaFilters.selectedProviders.length);
  const genresCount = useAppSelector((state) => state.mediaFilters.selectedGenres.length);
  const selectedDecade = useAppSelector((state) => state.mediaFilters.selectedDecade);

  useEffect(() => {
    if (!hasInitialized.current && savedProviders?.providers && savedProviders.providers.length > 0) {
      dispatch(setProviders(savedProviders.providers));
      hasInitialized.current = true;
    } else if (!hasInitialized.current && savedProviders !== null) {
      hasInitialized.current = true;
    }
  }, [dispatch, savedProviders]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (mediaType !== "both") count++;
    if (providersCount > 0) count++;
    if (genresCount > 0) count++;
    if (selectedDecade !== "all") count++;
    return count;
  }, [mediaType, providersCount, genresCount, selectedDecade]);

  const openFilters = useCallback(() => {
    setIsFilterVisible(true);
  }, []);

  const closeFilters = useCallback(() => {
    setIsFilterVisible(false);
    onApply?.();
  }, [onApply]);

  return (
    <>
      <View style={[styles.filterButtonContainer, style]}>
        <IconButton
          icon="tune-variant"
          iconColor={isFilterActive ? MD2DarkTheme.colors.primary : "#fff"}
          size={size}
          onPress={openFilters}
          style={styles.filterButton}
        />
        {activeFilterCount > 0 && (
          <Badge size={16} style={styles.badge} pointerEvents="none">
            {activeFilterCount}
          </Badge>
        )}
      </View>
      <FilterSheet visible={isFilterVisible} onClose={closeFilters} onCategorySelect={onCategorySelect} showCategories={showCategories} />
    </>
  );
});

export function useMediaFilters() {
  const mediaType = useAppSelector((state) => state.mediaFilters.mediaType);
  const selectedProviders = useAppSelector((state) => state.mediaFilters.selectedProviders);
  const selectedGenres = useAppSelector((state) => state.mediaFilters.selectedGenres);
  const selectedDecade = useAppSelector((state) => state.mediaFilters.selectedDecade);
  const isFilterActive = useAppSelector((state) => state.mediaFilters.isFilterActive);

  const getFilterParams = useCallback(() => {
    const params: {
      type?: "movie" | "tv" | "both";
      providers?: number[];
      genres?: number[];
      decade?: string;
    } = {};

    if (mediaType !== "both") {
      params.type = mediaType;
    }

    if (selectedProviders.length > 0) {
      params.providers = selectedProviders;
    }

    if (selectedGenres.length > 0) {
      params.genres = selectedGenres.map((g) => g.id);
    }

    if (selectedDecade !== "all") {
      params.decade = selectedDecade;
    }

    return params;
  }, [mediaType, selectedProviders, selectedGenres, selectedDecade]);

  return {
    mediaType,
    selectedProviders,
    selectedGenres,
    selectedDecade,
    isFilterActive,
    getFilterParams,
    hasActiveFilters: isFilterActive,
  };
}

const styles = StyleSheet.create({
  filterButtonContainer: {
    position: "relative",
  },
  filterButton: {
    margin: 0,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: MD2DarkTheme.colors.primary,
    minWidth: 16,
  },
});
