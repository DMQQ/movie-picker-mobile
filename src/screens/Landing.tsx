import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import PagerView from "react-native-pager-view";
import { useGetChipCategoriesQuery } from "../redux/movie/movieApi";
import AppLoadingOverlay from "../components/AppLoadingOverlay";
import LandingHeader from "../components/LandingHeader";
import NoConnectionError from "../components/NoConnectionError";
import { ScreenProps } from "./types";
import BottomTab from "../components/Landing/BottomTab";
import CategoryPage from "../components/Landing/CategoryPage";

import LoadingSkeleton from "../components/Landing/LoadingSkeleton";

export default function Landing({ navigation }: ScreenProps<"Landing">) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedChip, setSelectedChip] = useState("all");
  const [isSwipingPage, setIsSwipingPage] = useState(false);

  const { data: chipCategories = [] } = useGetChipCategoriesQuery();

  const handleChipPress = (chip: string) => {
    setSelectedChip(chip);
  };

  const scrollY = useSharedValue(0);

  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    if (!isSwipingPage) {
      const categoryIndex = chipCategories.findIndex((cat) => cat.id === selectedChip);
      if (categoryIndex !== -1 && categoryIndex !== currentPage) {
        setCurrentPage(categoryIndex);
        pagerRef.current?.setPage(categoryIndex);
      }
    }
  }, [selectedChip, chipCategories, isSwipingPage]);

  const handlePageSelected = useCallback(
    (e: any) => {
      const pageIndex = e.nativeEvent.position;
      setCurrentPage(pageIndex);
      setIsSwipingPage(false);

      const category = chipCategories[pageIndex];
      if (category && category.id !== selectedChip) {
        setSelectedChip(category.id);
      }
    },
    [chipCategories, selectedChip]
  );

  const handlePageScrollStateChanged = useCallback((e: any) => {
    const state = e.nativeEvent.pageScrollState;
    setIsSwipingPage(state === "dragging" || state === "settling");
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppLoadingOverlay />
      <NoConnectionError />

      {chipCategories.length > 0 ? (
        <>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={handlePageSelected}
            onPageScrollStateChanged={handlePageScrollStateChanged}
          >
            {chipCategories.map((category) => (
              <CategoryPage
                key={category.id + category.label}
                categoryId={category.id}
                isActive={selectedChip === category.id}
                navigation={navigation}
              />
            ))}
          </PagerView>
        </>
      ) : (
        <LoadingSkeleton />
      )}

      <BottomTab />
      <LandingHeader selectedChip={selectedChip} onChipPress={handleChipPress} scrollY={scrollY} />
    </View>
  );
}
