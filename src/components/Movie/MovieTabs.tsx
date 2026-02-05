import { Dimensions, StyleSheet, View, TouchableOpacity, LayoutChangeEvent, ScrollView, Platform } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import { memo, useState, useCallback, useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import PlatformBlurView from "../PlatformBlurView";
import DetailsTab from "./tabs/DetailsTab";
import CastTab from "./tabs/CastTab";
import SimilarTab from "./tabs/SimilarTab";
import TrailersTab from "./tabs/TrailersTab";
import SeasonsTab from "./tabs/SeasonsTab";
import { Movie } from "../../../types";

const { width } = Dimensions.get("window");

interface MovieTabsProps {
  movie: Movie & Record<string, string>;
  type: string;
  providers: any[];
  tabs: { key: string; title: string }[];
  isTVShow: boolean;
  hasSimilar: boolean;
  hasTrailers: boolean;
  similarData?: { results: Movie[]; page: number; total_pages: number };
  trailersData?: any[];
  castData?: any;
}

function MovieTabs({ movie, type, providers, tabs, similarData, trailersData, castData }: MovieTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0]));
  const [tabHeights, setTabHeights] = useState<Record<number, number>>({});

  const translateX = useSharedValue(0);
  const containerHeight = useSharedValue(500);

  const updateActiveTab = (index: number) => {
    setActiveTab(index);
    setVisitedTabs((prev) => new Set(prev).add(index));
  };

  useEffect(() => {
    translateX.value = withSpring(-activeTab * width, {
      damping: 50,
      stiffness: 150,
      mass: 1,
      overshootClamping: true,
    });

    const targetHeight = tabHeights[activeTab];
    if (targetHeight && targetHeight > 20) {
      containerHeight.value = withTiming(targetHeight, { duration: 250 });
    }
  }, [activeTab, tabHeights]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const newValue = -activeTab * width + e.translationX;
      const minValue = -(tabs.length - 1) * width;
      const maxValue = 0;
      translateX.value = Math.max(minValue, Math.min(maxValue, newValue));
    })
    .onEnd((e) => {
      if (e.translationX < -width * 0.2 || e.velocityX < -500) {
        if (activeTab < tabs.length - 1) {
          runOnJS(updateActiveTab)(activeTab + 1);
        } else {
          translateX.value = withSpring(-activeTab * width, { damping: 50 });
        }
      } else if (e.translationX > width * 0.2 || e.velocityX > 500) {
        if (activeTab > 0) {
          runOnJS(updateActiveTab)(activeTab - 1);
        } else {
          translateX.value = withSpring(-activeTab * width, { damping: 50 });
        }
      } else {
        translateX.value = withSpring(-activeTab * width, { damping: 50 });
      }
    })
    .activeOffsetX([-10, 10]);

  const handlePageLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;

    if (height < 10) return;

    setTabHeights((prev) => {
      const current = prev[index] || 0;
      if (Math.abs(current - height) < 2) return prev;
      return { ...prev, [index]: height };
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: width * tabs.length,
    flexDirection: "row",
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
  }));

  const renderContent = (index: number) => {
    if (!visitedTabs.has(index)) return <View style={{ height: 300, width: width }} />;

    const tabKey = tabs[index]?.key;

    switch (tabKey) {
      case "details":
        return <DetailsTab movie={movie} providers={providers} />;
      case "cast":
        return <CastTab id={movie?.id} type={type as "movie" | "tv"} initialData={castData} />;
      case "similar":
        return <SimilarTab id={movie?.id} type={type as "movie" | "tv"} initialData={similarData} />;
      case "trailers":
        return <TrailersTab initialData={trailersData} />;
      case "seasons":
        return <SeasonsTab id={movie?.id} seasons={(movie?.seasons as any) || []} />;
      default:
        return (
          <View style={{ padding: 20 }}>
            <Text>Missing Tab: {tabKey}</Text>
          </View>
        );
    }
  };

  return (
    <View>
      <PlatformBlurView style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScrollContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === index && styles.activeTabButton]}
              onPress={() => updateActiveTab(index)}
            >
              <Text style={[styles.tabLabel, activeTab === index && styles.activeTabLabel]}>{tab.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </PlatformBlurView>

      <Animated.View style={[styles.wrapper, containerStyle]}>
        <GestureDetector gesture={pan}>
          <Animated.View style={animatedStyle}>
            {tabs.map((_, index) => (
              <View key={index} style={styles.page}>
                <View onLayout={(e) => handlePageLayout(index, e)} style={styles.contentInner}>
                  {renderContent(index)}
                </View>
              </View>
            ))}
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

export default memo(MovieTabs);

const styles = StyleSheet.create({
  tabBarContainer: {
    borderRadius: 20,
    marginBottom: 10,
    marginHorizontal: 15,
    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface + "cc",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#343434ff",
      },
    }),
  },
  tabBarScrollContainer: {
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
    textTransform: "capitalize",
  },
  activeTabLabel: {
    color: "#fff",
    fontWeight: "800",
  },
  wrapper: {
    width: width,
    position: "relative",
  },
  page: {
    width: width,
    justifyContent: "flex-start",
  },
  contentInner: {
    width: "100%",
  },
});
