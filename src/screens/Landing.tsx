import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Platform, RefreshControl, StyleSheet, TouchableOpacity, View, VirtualizedList } from "react-native";
import { ActivityIndicator, MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import PagerView from "react-native-pager-view";
import { useGetChipCategoriesQuery, useLazyGetLandingPageMoviesQuery } from "../redux/movie/movieApi";
import { arrayInsertsAt } from "../utils/utilities";
import uniqueBy from "../utils/unique";
import { Movie } from "../../types";
import AppLoadingOverlay from "../components/AppLoadingOverlay";
import FeaturedSection from "../components/Landing/FeaturedSection";
import LandingHeader from "../components/LandingHeader";
import NoConnectionError from "../components/NoConnectionError";

import SectionListItem from "../components/SectionItem";
import Thumbnail, { prefetchThumbnail } from "../components/Thumbnail";
import { useLazyGetSectionMoviesQuery } from "../redux/movie/movieApi";
import { SectionData } from "../service/useLanding";
import useTranslation from "../service/useTranslation";
import { ScreenProps } from "./types";
import BottomTab from "../components/Landing/BottomTab";
import Skeleton from "../components/Skeleton/Skeleton";

const { width } = Dimensions.get("screen");

const keyExtractor = (item: any) => {
  if (item?.type === "game") {
    return `section-${item.gameType}`;
  }
  return `section-${item.name}`;
};

const getItemCount = (data: any) => data?.length || 0;

const getItem = (data: any, index: number) => data[index];

const AnimatedVirtualizedList = Animated.createAnimatedComponent(VirtualizedList);

interface CategoryPageProps {
  categoryId: string;
  isActive: boolean;
  navigation: any;
}

const CategoryPage = memo(({ categoryId }: CategoryPageProps) => {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SectionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [getLandingMovies, { error }] = useLazyGetLandingPageMoviesQuery();
  const t = useTranslation();

  useEffect(() => {
    if (data.length === 0) {
      getLandingMovies({ skip: 0, take: 8, category: categoryId }, true).then((response) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setHasMore(response.data.length >= 8);
          const uniqueMovieSections = uniqueBy(response.data.filter(item => item && item.name), "name");
          setData(
            arrayInsertsAt(
              uniqueMovieSections,
              [3, 8, 14, 20],
              [
                { name: "Game Invite 1", results: [], type: "game" as const, gameType: "social" as const },
                { name: "Game Invite 2", results: [], type: "game" as const, gameType: "voter" as const },
                { name: "Game Invite 3", results: [], type: "game" as const, gameType: "fortune" as const },
                { name: "Game Invite 4", results: [], type: "game" as const, gameType: "all-games" as const },
              ]
            )
          );
        }
      });
    }
  }, [categoryId, getLandingMovies]);

  const onEndReached = useCallback(() => {
    if (error || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);

    getLandingMovies({ skip: nextPage * 8, take: 8, category: categoryId }, true).then((response) => {
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setHasMore(response.data.length >= 8);
        setData((prev) => {
          // Get existing game sections to preserve them
          const gameSections = prev.filter((item) => item && typeof item === 'object' && "type" in item && (item as any).type === "game");
          // Remove game sections and get only movie sections
          const movieSections = prev.filter((item) => item && typeof item === 'object' && !("type" in item && (item as any).type === "game"));
          // Combine with new data and remove duplicates by name
          const newMovieSections = uniqueBy([...movieSections, ...(response.data || []).filter(item => item && item.name)], "name");
          // Re-insert game sections at their original positions
          return arrayInsertsAt(
            newMovieSections,
            [3, 8, 14, 20],
            gameSections
          );
        });
      } else {
        setHasMore(false);
      }
    });
  }, [error, hasMore, page, categoryId, getLandingMovies]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setData([]);

    getLandingMovies({ skip: 0, take: 8, category: categoryId }).then((response) => {
      if (response.data && Array.isArray(response.data)) {
        const uniqueMovieSections = uniqueBy(response.data.filter(item => item && item.name), "name");
        setData(
          arrayInsertsAt(
            uniqueMovieSections,
            [3, 8, 14, 20],
            [
              { name: "Game Invite 1", results: [], type: "game" as const, gameType: "social" as const },
              { name: "Game Invite 2", results: [], type: "game" as const, gameType: "voter" as const },
              { name: "Game Invite 3", results: [], type: "game" as const, gameType: "fortune" as const },
              { name: "Game Invite 4", results: [], type: "game" as const, gameType: "all-games" as const },
            ]
          )
        );
      }
      setRefreshing(false);
    });
  }, [categoryId, getLandingMovies]);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const getItemLayout = useCallback((data: SectionData[], index: number) => {
    const item = data?.[index];
    const isGame = item && "type" in item && item.type === "game";
    const itemHeight = isGame ? 210 : Math.min(width * 0.3, 200) * 1.75 + 50;

    let offset = 0;
    for (let i = 0; i < index; i++) {
      const prevItem = data?.[i];
      const prevIsGame = prevItem && "type" in prevItem && prevItem.type === "game";
      offset += prevIsGame ? 210 : Math.min(width * 0.3, 200) * 1.75 + 50;
    }

    return { length: itemHeight, offset, index };
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SectionData }) => {
      if (!item || typeof item !== 'object') return null;
      
      if ("type" in item && item.type === "game") {
        return <GameInviteSection type={item.gameType} navigation={navigation} />;
      }

      return <Section group={item} categoryId={categoryId} />;
    },
    [navigation, categoryId]
  );

  // Create category-specific key extractor to avoid duplicate keys
  const categoryKeyExtractor = useCallback((item: any, index: number) => {
    if (!item || typeof item !== 'object') return `${categoryId}-section-empty-${index}`;
    if (item?.type === "game") {
      return `${categoryId}-section-${item.gameType || 'unknown'}-${index}`;
    }
    return `${categoryId}-section-${item.name || 'unknown'}-${index}`;
  }, [categoryId]);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedVirtualizedList
        extraData={categoryId}
        overScrollMode={"never"}
        bounces={false}
        initialNumToRender={3}
        onScroll={onScroll}
        data={data}
        renderItem={renderItem as any}
        keyExtractor={categoryKeyExtractor}
        getItemCount={getItemCount}
        getItem={getItem}
        onEndReached={onEndReached}
        removeClippedSubviews
        onEndReachedThreshold={0.1}
        ListHeaderComponent={<FeaturedSection selectedChip={categoryId} navigate={navigation.navigate} />}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        getItemLayout={getItemLayout}
        style={{ flex: 1 }}
        ListFooterComponent={
          <View style={{ minHeight: 200 }}>
            {hasMore ? (
              <LoadingSkeleton />
            ) : (
              <Animated.View style={noMoreResultsStyles.container} entering={FadeIn.duration(400)}>
                <FontAwesome name="check-circle" size={32} color="rgba(255, 255, 255, 0.6)" />
                <Text style={noMoreResultsStyles.text}>{t("landing.no_more_results")}</Text>
                <Text style={noMoreResultsStyles.subtitle}>{t("landing.reached_end")}</Text>
              </Animated.View>
            )}
          </View>
        }
      />
    </View>
  );
});

const LoadingSkeleton = memo(() => {
  const movieWidth = Math.min(width * 0.25, 120);
  const movieHeight = movieWidth * 1.5;

  return (
    <View style={skeletonStyles.container}>
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <Animated.View key={sectionIndex} style={skeletonStyles.sectionContainer} entering={FadeIn.duration(600).delay(sectionIndex * 100)}>
          <Skeleton>
            <View style={{ width: 150, height: 25, backgroundColor: "#333", borderRadius: 5 }} />
          </Skeleton>
          <View style={skeletonStyles.moviesList}>
            {Array.from({ length: 4 }).map((_, movieIndex) => (
              <View key={movieIndex} style={skeletonStyles.movieCard}>
                <Skeleton>
                  <View style={{ width: movieWidth, height: movieHeight, backgroundColor: "#333", borderRadius: 8 }} />
                </Skeleton>
              </View>
            ))}
          </View>
        </Animated.View>
      ))}
    </View>
  );
});

const skeletonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  moviesList: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  movieCard: {
    alignItems: "center",
  },
});

const pageIndicatorStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  blurContainer: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    overflow: "hidden",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

const noMoreResultsStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
  },
});

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

  return (
    <View style={{ flex: 1 }}>
      <AppLoadingOverlay />
      <NoConnectionError />

      {chipCategories.length > 0 ? (
        <PagerView ref={pagerRef} style={{ flex: 1 }} initialPage={0} onPageSelected={handlePageSelected}>
          {chipCategories.map((category) => (
            <CategoryPage
              key={category.id + category.label}
              categoryId={category.id}
              isActive={selectedChip === category.id}
              navigation={navigation}
            />
          ))}
        </PagerView>
      ) : (
        <LoadingSkeleton />
      )}

      <BottomTab />
      <LandingHeader selectedChip={selectedChip} onChipPress={handleChipPress} scrollY={scrollY} />
    </View>
  );
}

interface SectionProps {
  group: { name: string; results: Movie[] };
  categoryId?: string;
}

const sectionStyles = StyleSheet.create({
  container: { paddingHorizontal: 15, minHeight: Math.min(width * 0.25, 200) * 1.75 + 50, paddingBottom: 50 },
  title: { color: "#fff", fontSize: 35, fontFamily: "Bebas", marginBottom: 10 },
  list: {
    flex: 1,
  },
  listContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

export const Section = memo(({ group, categoryId }: SectionProps) => {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const [getSectionMovies, state] = useLazyGetSectionMoviesQuery();

  const [movies, setSectionMovies] = useState<Movie[]>(() => group.results);

  // Create category-specific key extractor for movies within this section
  const movieKeyExtractor = useCallback((item: any, index: number) => 
    `${categoryId || 'default'}-${group.name}-${item.id}-${item.type || "movie"}`, 
    [categoryId, group.name]
  );

  const onEndReached = useCallback(() => {
    if (state.isLoading || !!state.error) return;
    setPage((prev) => prev + 1);
  }, [state.isLoading, state.error]);

  useEffect(() => {
    if (page === 1) return;

    getSectionMovies({ name: group.name, page }).then((response) => {
      if (response.data && Array.isArray(response.data.results)) {
        Promise.allSettled(response.data.results.map((i) => prefetchThumbnail(i.poster_path, 185)));

        setSectionMovies((prev) => prev.concat(response?.data?.results || []));
      }
    });
  }, [page]);

  if (movies.length === 0 && !state.isLoading) return null;

  const movieWidth = Math.min(width * 0.25, 120);
  const movieHeight = movieWidth * 1.5;

  return (
    <Animated.View style={sectionStyles.container} entering={FadeIn}>
      <Text style={sectionStyles.title}>{group.name}</Text>
      {movies.length > 0 && (
        <FlashList
          onEndReached={onEndReached}
          data={(movies || []) as any}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={movieKeyExtractor}
          renderItem={({ item }) => (
            <SectionListItem
              onPress={() => {
                navigation.navigate("MovieDetails", {
                  id: item.id,
                  type: item.type,
                  img: item.poster_path,
                });
              }}
              {...item}
            />
          )}
          ListFooterComponent={
            state.isLoading ? (
              <View style={skeletonStyles.moviesList}>
                {[...Array(2)].map((_, index) => (
                  <View style={skeletonStyles.movieCard} key={index}>
                    <Skeleton>
                      <View style={{ width: movieWidth, height: movieHeight, backgroundColor: "#333", borderRadius: 8 }} />
                    </Skeleton>
                  </View>
                ))}
              </View>
            ) : null
          }
        />
      )}
    </Animated.View>
  );
});

const gameInviteStyles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 180,
    marginBottom: 30,
  },
  backgroundMovies: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.3,
  },
  movieThumbnail: {
    width: "33.33%",
    height: "50%",
    opacity: 0.6,
  },
  blurContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  title: {
    fontSize: 28,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    borderRadius: 25,
    overflow: "hidden",
    minWidth: 180,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

const backgroundImages = [
  "/nGrUZvMxVqJvW1VsJ3QZStxnsZN.jpg",
  "/kWm4HxanOhRWfW9PzigkUXulwdG.jpg",
  "/wO15XEgeLbeijtf3MQAUqWCxSxc.jpg",
  "/odEEx7fS8GcZcZ5rEZnrrLsDIm7.jpg",
  "/y7tjLYcq2ZGy2DNG0ODhGX9Tm60.jpg",
  "/mIg1qCkVxnAlM2TK3RUF0tdEXlE.jpg",
  "/cpf7vsRZ0MYRQcnLWteD5jK9ymT.jpg",
];

const GameInviteSection = memo(
  ({ type, navigation }: { type: "quick" | "social" | "voter" | "fortune" | "all-games"; navigation: any }) => {
    const t = useTranslation();

    const getGameConfig = (gameType: typeof type) => {
      switch (gameType) {
        case "quick":
          return {
            title: t("game-invite.quick-title"),
            subtitle: t("game-invite.quick-subtitle"),
            buttonText: t("game-invite.quick-button"),
            colors: ["#6366f1", "#8b5cf6"] as const,
            icon: "gamepad",
            navigation: () => navigation.navigate("Games"),
          };
        case "social":
          return {
            title: t("game-invite.social-title"),
            subtitle: t("game-invite.social-subtitle"),
            buttonText: t("game-invite.social-button"),
            colors: ["#f59e0b", "#ef4444"] as const,
            icon: "users",
            navigation: () =>
              navigation.navigate("QRCode", {
                screen: "CreateQRCode",
                params: { quickStart: true },
              }),
          };
        case "voter":
          return {
            title: t("game-invite.voter-title"),
            subtitle: t("game-invite.voter-subtitle"),
            buttonText: t("game-invite.voter-button"),
            colors: ["#10b981", "#059669"] as const,
            icon: "thumbs-up",
            navigation: () => navigation.navigate("Voter", { screen: "Home" }),
          };
        case "fortune":
          return {
            title: t("game-invite.fortune-title"),
            subtitle: t("game-invite.fortune-subtitle"),
            buttonText: t("game-invite.fortune-button"),
            colors: ["#8b5cf6", "#7c3aed"] as const,
            icon: "refresh",
            navigation: () => navigation.navigate("Fortune"),
          };
        case "all-games":
          return {
            title: t("game-invite.all-games-title"),
            subtitle: t("game-invite.all-games-subtitle"),
            buttonText: t("game-invite.all-games-button"),
            colors: ["#374151", "#6b7280"] as const,
            icon: "list",
            navigation: () => navigation.navigate("Games"),
          };
        default:
          return {
            title: "",
            subtitle: "",
            buttonText: "",
            colors: ["#6366f1", "#8b5cf6"] as const,
            icon: "gamepad",
            navigation: () => navigation.navigate("Games"),
          };
      }
    };

    const config = getGameConfig(type);

    const handleGamePress = useCallback(() => {
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      config.navigation();
    }, [type, navigation]);

    const gradientColors = config.colors;

    return (
      <Animated.View style={gameInviteStyles.container} entering={FadeIn.delay(200)}>
        {/* Background Movies */}
        <View style={gameInviteStyles.backgroundMovies}>
          {backgroundImages.slice(0, 6).map((image, index) => (
            <Thumbnail key={`${image}`} path={image} size={185} container={gameInviteStyles.movieThumbnail} priority="low" />
          ))}
        </View>

        {/* Blur Overlay with Content */}
        <View style={gameInviteStyles.blurContainer}>
          <Text style={gameInviteStyles.title}>{config.title}</Text>
          <Text style={gameInviteStyles.subtitle}>{config.subtitle}</Text>

          <TouchableOpacity style={gameInviteStyles.button} onPress={handleGamePress} activeOpacity={0.8}>
            <LinearGradient colors={gradientColors} style={gameInviteStyles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <FontAwesome name={config.icon as any} size={18} color="#fff" />
              <Text style={gameInviteStyles.buttonText}>{config.buttonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
);
