import {
  Platform,
  StyleSheet,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import PagerView from "react-native-pager-view";
import { Movie } from "../../../types";
import useTranslation from "../../service/useTranslation";
import CustomFavourite from "../Favourite";
import FrostedGlass from "../FrostedGlass";
import QuickActions from "../QuickActions";
import RatingIcons from "../RatingIcons";
import PlatformBlurView, { BlurViewWrapper } from "../PlatformBlurView";
import {
  useGetMovieProvidersQuery,
  useGetSimilarQuery,
  useGetTrailersQuery,
} from "../../redux/movie/movieApi";
import { memo, useMemo, useState, useRef, useEffect } from "react";
import DetailsTab from "./tabs/DetailsTab";
import CastTab from "./tabs/CastTab";
import SimilarTab from "./tabs/SimilarTab";
import TrailersTab from "./tabs/TrailersTab";
import SeasonsTab from "./tabs/SeasonsTab";
import { GlassView } from "expo-glass-effect";

const { height, width } = Dimensions.get("window");

function MovieDetails({
  movie,
  type,
  params,
}: {
  movie: Movie & Record<string, string>;

  type: string;

  params: {
    id: string;
    type: string;
  };
}) {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>(
    [],
  );

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const { data: providers = [] } = useGetMovieProvidersQuery(
    {
      id: Number(params.id),
      type: params.type,
    },
    {
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
      skip: !params.id || !params.type,
    },
  );

  const { data: similarData } = useGetSimilarQuery(
    {
      id: Number(params.id),
      type: params.type as "movie" | "tv",
      page: 1,
    },
    {
      skip: !params.id || !params.type,
    },
  );

  const { data: trailersData } = useGetTrailersQuery(
    {
      id: Number(params.id),
      type: params.type,
    },
    {
      skip: !params.id || !params.type,
    },
  );

  const hasSimilar = useMemo(() => {
    return (similarData?.results && similarData.results.length > 0) ?? false;
  }, [similarData]);

  const hasTrailers = useMemo(() => {
    return (trailersData && trailersData.length > 0) ?? false;
  }, [trailersData]);

  const data = useMemo(
    () =>
      [
        movie?.release_date || movie?.first_air_date,
        (movie?.title || movie?.name) ===
        (movie?.original_title || movie?.original_name)
          ? null
          : movie?.original_title || movie?.original_name,
        ...(movie?.genres || [])?.map((g: any) => g.name),
      ].filter((v) => v !== undefined && v !== "" && v !== null) as string[],
    [movie],
  );

  const isTVShow = type === "tv";

  const tabs = useMemo(() => {
    const baseTabs = [
      { key: "details", title: t("movie.tabs.details") || "Details" },
      { key: "cast", title: t("movie.tabs.cast") || "Cast" },
    ];

    if (hasSimilar) {
      baseTabs.push({
        key: "similar",
        title: t("movie.tabs.similar") || "Similar",
      });
    }

    if (hasTrailers) {
      baseTabs.push({
        key: "trailers",
        title: t("movie.tabs.trailers") || "Trailers",
      });
    }

    if (isTVShow) {
      baseTabs.push({
        key: "seasons",
        title: t("movie.tabs.seasons") || "Seasons",
      });
    }

    return baseTabs;
  }, [isTVShow, t, hasSimilar, hasTrailers]);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  const handleTabLayout = (index: number, x: number, width: number) => {
    setTabLayouts((prev) => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width };
      return newLayouts;
    });
  };

  useEffect(() => {
    if (tabLayouts[activeTab]) {
      indicatorX.value = withSpring(tabLayouts[activeTab].x, {
        damping: 20,
        stiffness: 200,
      });
      indicatorWidth.value = withSpring(tabLayouts[activeTab].width, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [activeTab, tabLayouts]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const pagerPages = useMemo(() => {
    const pages = [
      <View key="details" style={styles.page} collapsable={false}>
        <DetailsTab movie={movie} providers={providers} />
      </View>,
      <View key="cast" style={styles.page} collapsable={false}>
        <CastTab id={movie?.id} type={type as "movie" | "tv"} />
      </View>,
    ];

    if (hasSimilar) {
      pages.push(
        <View key="similar" style={styles.page} collapsable={false}>
          <SimilarTab id={movie?.id} type={type as "movie" | "tv"} />
        </View>,
      );
    }

    if (hasTrailers) {
      pages.push(
        <View key="trailers" style={styles.page} collapsable={false}>
          <TrailersTab id={movie?.id} type={type} />
        </View>,
      );
    }

    if (isTVShow) {
      pages.push(
        <View key="seasons" style={styles.page} collapsable={false}>
          <SeasonsTab id={movie?.id} seasons={(movie?.seasons as any) || []} />
        </View>,
      );
    }

    return pages;
  }, [movie, providers, type, isTVShow, hasSimilar, hasTrailers]);

  return (
    <Animated.View entering={FadeIn}>
      <BlurViewWrapper style={styles.blurWrapper}>
        <Text style={styles.heading}>{movie?.title || movie?.name || "-"}</Text>

        {!!movie?.tagline && (
          <Text style={styles.tagline}>
            {movie?.tagline ? `"${movie?.tagline}"` : ""}
          </Text>
        )}

        <View style={styles.rating}>
          <RatingIcons size={20} vote={movie?.vote_average} />
        </View>

        <Text style={styles.categories}>{data.join(" | ")}</Text>

        <View style={{ paddingVertical: 15 }}>
          <PlatformBlurView style={styles.quickActions}>
            <QuickActions movie={movie}>
              <View style={{ flex: 1 }}>
                <CustomFavourite movie={movie} />
              </View>
            </QuickActions>
          </PlatformBlurView>
        </View>

        {/* Custom Tab Bar */}
        <PlatformBlurView style={styles.tabBarContainer}>
          <View style={styles.tabBarWrapper}>
            <Animated.View
              style={[styles.tabIndicator, animatedIndicatorStyle]}
            ></Animated.View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBarContent}
            >
              {tabs.map((tab, index) => (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabButton}
                  onPress={() => handleTabPress(index)}
                  onLayout={(e) => {
                    const { x, width } = e.nativeEvent.layout;
                    handleTabLayout(index, x, width);
                  }}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === index && styles.activeTabLabel,
                    ]}
                  >
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </PlatformBlurView>

        {/* Pager View */}
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
        >
          {pagerPages}
        </PagerView>

        <View style={styles.attributions}>
          <Text style={[styles.text, { textAlign: "center" }]}>
            {t("global.attributions")}
          </Text>
        </View>
      </BlurViewWrapper>
    </Animated.View>
  );
}

export default memo(MovieDetails);

const styles = StyleSheet.create({
  blurWrapper: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface + "cc",

        borderWidth: 2,
        borderColor: "#343434ff",
      },
    }),

    padding: 15,
  },

  heading: {
    fontSize: 50,
    fontFamily: "Bebas",
    lineHeight: 55,
    marginTop: 10,
  },

  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 10,
  },

  categories: { color: "rgba(255,255,255,0.7)", fontSize: 15 },

  rating: { flexDirection: "row", marginBottom: 10 },

  quickActions: {
    paddingVertical: 20,
    paddingLeft: 5,
    borderRadius: 20,
  },

  text: { fontSize: 15, color: "rgba(255,255,255,0.6)" },

  attributions: { padding: 20, justifyContent: "center", height: 100 },

  tabBarContainer: {
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },

  tabBarWrapper: {
    position: "relative",
  },

  tabBarContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexGrow: 1,
  },

  tabButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: "relative",
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  tabLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textTransform: "capitalize" as const,
    zIndex: 1,
  },

  activeTabLabel: {
    color: "#fff",
    fontWeight: "800",
  },

  tabIndicator: {
    position: "absolute",
    top: 6,
    left: 0,
    height: 48,
    backgroundColor: MD2DarkTheme.colors.primary + "aa",
    borderRadius: 10,
  },

  pagerView: {
    height: height * 0.5,
    marginTop: 10,
  },

  page: {
    flex: 1,
  },
});
