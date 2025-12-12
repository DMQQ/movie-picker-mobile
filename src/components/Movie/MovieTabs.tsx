import { Dimensions, ScrollView, TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import { memo, useMemo, useState, useRef, useCallback } from "react";
import PlatformBlurView from "../PlatformBlurView";
import DetailsTab from "./tabs/DetailsTab";
import CastTab from "./tabs/CastTab";
import SimilarTab from "./tabs/SimilarTab";
import TrailersTab from "./tabs/TrailersTab";
import SeasonsTab from "./tabs/SeasonsTab";
import { Movie } from "../../../types";

const { height, width } = Dimensions.get("window");

interface MovieTabsProps {
  movie: Movie & Record<string, string>;
  type: string;
  providers: any[];
  tabs: { key: string; title: string }[];
  isTVShow: boolean;
  hasSimilar: boolean;
  hasTrailers: boolean;
}

function MovieTabs({ movie, type, providers, tabs, isTVShow, hasSimilar, hasTrailers }: MovieTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0]));

  const handleTabPress = useCallback((index: number) => {
    setActiveTab(index);
    setVisitedTabs((prev) => new Set(prev).add(index));
    scrollRef.current?.scrollTo({ x: index * width, animated: false });
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / width);
      if (index !== activeTab) {
        setActiveTab(index);
        setVisitedTabs((prev) => new Set(prev).add(index));
      }
    },
    [activeTab]
  );

  const getTabIndex = useCallback(
    (key: string) => {
      return tabs.findIndex((tab) => tab.key === key);
    },
    [tabs]
  );

  const pagerPages = useMemo(() => {
    const pages = [
      <View key="details" style={styles.page}>
        {visitedTabs.has(0) && <DetailsTab movie={movie} providers={providers} />}
      </View>,
      <View key="cast" style={styles.page}>
        {visitedTabs.has(1) && <CastTab id={movie?.id} type={type as "movie" | "tv"} />}
      </View>,
    ];

    if (hasSimilar) {
      const similarIndex = getTabIndex("similar");
      pages.push(
        <View key="similar" style={styles.page}>
          {visitedTabs.has(similarIndex) && <SimilarTab id={movie?.id} type={type as "movie" | "tv"} />}
        </View>
      );
    }

    if (hasTrailers) {
      const trailersIndex = getTabIndex("trailers");
      pages.push(
        <View key="trailers" style={styles.page}>
          {visitedTabs.has(trailersIndex) && <TrailersTab id={movie?.id} type={type} />}
        </View>
      );
    }

    if (isTVShow) {
      const seasonsIndex = getTabIndex("seasons");
      pages.push(
        <View key="seasons" style={styles.page}>
          {visitedTabs.has(seasonsIndex) && <SeasonsTab id={movie?.id} seasons={(movie?.seasons as any) || []} />}
        </View>
      );
    }

    return pages;
  }, [movie, providers, type, isTVShow, hasSimilar, hasTrailers, visitedTabs, tabs, getTabIndex]);

  return (
    <>
      {/* Custom Tab Bar */}
      <PlatformBlurView style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === index && styles.activeTabButton]}
              onPress={() => handleTabPress(index)}
            >
              <Text style={[styles.tabLabel, activeTab === index && styles.activeTabLabel]}>{tab.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </PlatformBlurView>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        directionalLockEnabled={false}
        bounces={false}
      >
        {pagerPages}
      </ScrollView>
    </>
  );
}

export default memo(MovieTabs);

const styles = StyleSheet.create({
  tabBarContainer: {
    borderRadius: 15,
  },

  tabBarContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },

  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  activeTabButton: {
    backgroundColor: MD2DarkTheme.colors.primary + "aa",
  },

  tabLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textTransform: "capitalize" as const,
  },

  activeTabLabel: {
    color: "#fff",
    fontWeight: "800",
  },

  scrollView: {
    marginTop: 10,
    height: height * 0.75,
    marginHorizontal: -15,
  },

  page: {
    width: width,
    height: height * 0.75,
  },
});
