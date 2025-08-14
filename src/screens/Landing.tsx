import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  VirtualizedList,
} from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn, FadeInDown, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../types";
import AppLoadingOverlay from "../components/AppLoadingOverlay";
import FrostedGlass from "../components/FrostedGlass";
import LandingHeader from "../components/LandingHeader";
import NoConnectionError from "../components/NoConnectionError";
import RatingIcons from "../components/RatingIcons";
import ScoreRing from "../components/ScoreRing";
import Thumbnail, { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import { useGetFeaturedQuery, useLazyGetLandingPageMoviesQuery, useLazyGetSectionMoviesQuery } from "../redux/movie/movieApi";
import useTranslation from "../service/useTranslation";
import { arrayInsertsAt } from "../utils/utilities";
import { ScreenProps } from "./types";

const { width, height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    padding: 5,
  },

  featuredImage: {
    width,
    height: height / 1.3,
    position: "relative",
    marginBottom: 35,
  },

  gradientContainer: { flex: 1, position: "absolute", bottom: 0, width, paddingTop: 30 },

  overview: { fontSize: 16, color: "rgba(255,255,255,0.95)", fontWeight: "500" },
});

const gradient = ["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.8)", "#000000"] as any;

const keyExtractor = (item: any, index: number) => {
  if ("type" in item && item.type === "game") {
    return `game-${item.gameType}-${index}`;
  }
  return `section-${item.name}-${index}`;
};

const getItemCount = (data: any) => data?.length || 0;

const getItem = (data: any, index: number) => data[index];

const AnimatedVirtualizedList = Animated.createAnimatedComponent(VirtualizedList);

export default function Landing({ navigation }: ScreenProps<"Landing">) {
  const [page, setPage] = useState(1);
  const [selectedChip, setSelectedChip] = useState("all");
  const previousChip = useRef(selectedChip);

  type SectionData =
    | { name: string; results: Movie[] }
    | { name: string; results: Movie[]; type: "game"; gameType: "quick" | "social" | "voter" | "fortune" | "all-games" };
  const [data, setData] = useState<SectionData[]>([]);

  const [getLandingMovies, { error }] = useLazyGetLandingPageMoviesQuery();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (previousChip.current !== selectedChip) {
      setPage(0);
      setData([]);
      previousChip.current = selectedChip;
    }
  }, [selectedChip]);

  useEffect(() => {
    getLandingMovies({ skip: page * 8, take: 8, category: selectedChip }, true).then((response) => {
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setHasMore(response.data.length >= 8);
        setData((prev) => {
          const uniqueSections = (response.data || []).filter(
            (newSection) => !prev.some((existingSection) => existingSection.name === newSection.name)
          );

          return arrayInsertsAt(
            [...prev.filter((item) => !("type" in item && (item as any).type === "game")), ...uniqueSections],
            [3, 8, 14, 20],
            [
              {
                name: "Game Invite 1",
                results: [],
                type: "game" as const,
                gameType: "social" as const,
              },
              {
                name: "Game Invite 2",
                results: [],
                type: "game" as const,
                gameType: "voter" as const,
              },
              {
                name: "Game Invite 3",
                results: [],
                type: "game" as const,
                gameType: "fortune" as const,
              },
              {
                name: "Game Invite 4",
                results: [],
                type: "game" as const,
                gameType: "all-games" as const,
              },
            ]
          );
        });
      } else if (hasMore) {
        setPage((prev) => {
          return prev + 1;
        });
        setHasMore(false);
      }
    });
  }, [page, hasMore, selectedChip]);

  const onEndReached = useCallback(() => {
    if (error || !hasMore) return;

    setPage((prev) => {
      return prev + 1;
    });
  }, [error, hasMore]);

  const renderItem = useCallback(
    ({ item, index }: { item: SectionData; index: number }) => {
      if ("type" in item && item.type === "game") {
        const previousSections = data.slice(0, index).filter((section) => !("type" in section));
        const backgroundMovies = previousSections.flatMap((section) => section.results).slice(0, 6);

        return <GameInviteSection type={item.gameType} navigation={navigation} backgroundMovies={backgroundMovies} />;
      }

      return <Section group={item} />;
    },
    [navigation, data]
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setData([]);
    getLandingMovies({ skip: 0, take: 5, category: selectedChip }).then((response) => {
      if (response.data && Array.isArray(response.data)) {
        setData(
          arrayInsertsAt(
            response.data,
            [3, 8, 14, 20],
            [
              {
                name: "Game Invite 1",
                results: [],
                type: "game" as const,
                gameType: "social" as const,
              },
              {
                name: "Game Invite 2",
                results: [],
                type: "game" as const,
                gameType: "voter" as const,
              },
              {
                name: "Game Invite 3",
                results: [],
                type: "game" as const,
                gameType: "fortune" as const,
              },
              {
                name: "Game Invite 4",
                results: [],
                type: "game" as const,
                gameType: "all-games" as const,
              },
            ]
          )
        );
      }
      setRefreshing(false);
    });
  }, [selectedChip]);

  const handleChipPress = (chip: string) => {
    setSelectedChip(chip);
  };

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const getItemLayout = useCallback((data: SectionData[], index: number) => {
    const item = data?.[index];
    const isGame = item && "type" in item && item.type === "game";
    const itemHeight = isGame ? 210 : height * 0.275 + 30;

    let offset = 0;
    for (let i = 0; i < index; i++) {
      const prevItem = data?.[i];
      const prevIsGame = prevItem && "type" in prevItem && prevItem.type === "game";
      offset += prevIsGame ? 210 : height * 0.275 + 30;
    }

    return { length: itemHeight, offset, index };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <AppLoadingOverlay />
      <NoConnectionError />

      <AnimatedVirtualizedList
        onScroll={onScroll}
        data={data}
        initialNumToRender={3}
        renderItem={renderItem as any}
        keyExtractor={keyExtractor}
        getItemCount={getItemCount}
        getItem={getItem}
        onEndReached={onEndReached}
        ListHeaderComponent={<FeaturedSection navigate={navigation.navigate} />}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        removeClippedSubviews
        getItemLayout={getItemLayout}
      />

      <BottomTab navigate={navigation.navigate} />
      <LandingHeader selectedChip={selectedChip} onChipPress={handleChipPress} scrollY={scrollY} />
    </View>
  );
}

const FeaturedSection = memo(
  (props: { navigate: any }) => {
    const { data: featured, error } = useGetFeaturedQuery();
    const navigation = useNavigation<any>();

    const onPress = () => {
      navigation.navigate("MovieDetails", {
        id: featured?.id,
        type: featured?.type,
        img: featured?.poster_path,
      });
    };

    const details = [
      featured?.release_date || featured?.first_air_date,
      ((featured?.title || featured?.name) === (featured?.original_title || featured?.original_name) && featured?.original_title) ||
        featured?.original_name,
      ...(featured?.genres || []),
    ]
      .filter(Boolean)
      .join(" | ");

    useEffect(() => {
      if (!featured?.poster_path) return;

      prefetchThumbnail(featured?.poster_path, ThumbnailSizes.poster.xxlarge);
    }, [featured?.poster_path]);

    if (!featured || error) return null;

    return (
      <ImageBackground
        style={styles.featuredImage}
        source={{
          uri: "https://image.tmdb.org/t/p/w780" + featured?.poster_path,
        }}
        defaultSource={{ uri: featured?.placeholder_poster_path }}
      >
        <LinearGradient style={styles.gradientContainer} colors={gradient}>
          <Animated.View entering={FadeInDown.delay(750)}>
            <Pressable onPress={onPress}>
              <FrostedGlass style={{ padding: 15, borderBottomWidth: 0 }} container={{ borderWidth: 0 }}>
                <Text style={{ fontSize: 40, fontFamily: "Bebas", lineHeight: 50 }} numberOfLines={2}>
                  {featured?.title || featured?.name}
                </Text>
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <RatingIcons vote={featured?.vote_average} size={20} />
                </View>
                <Text style={{ color: "rgba(255,255,255,0.9)", marginBottom: 10 }}>{details}</Text>
                <Text numberOfLines={7} style={styles.overview}>
                  {featured?.overview}
                </Text>
              </FrostedGlass>
            </Pressable>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    );
  },
  () => true
);

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Platform.OS === "android" ? "#000" : "transparent",
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    height: "100%",
  },
  buttonLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.5,
    marginTop: 5,
  },
});

const BottomTab = memo(
  ({ navigate }: { navigate: any }) => {
    const t = useTranslation();
    const insets = useSafeAreaInsets();

    const withTouch = (fn: () => void) => {
      return () => {
        if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        fn();
      };
    };

    return (
      <BlurView
        intensity={Platform.OS === "ios" ? 60 : 100}
        tint="dark"
        style={[{ flexDirection: "row", paddingBottom: insets.bottom, paddingTop: 10 }, tabStyles.container]}
      >
        <TouchableOpacity activeOpacity={0.8} style={tabStyles.button} onPress={withTouch(() => navigate("Favourites"))}>
          <>
            <FontAwesome name="bookmark" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.favourites")}</Text>
          </>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            tabStyles.button,
            { backgroundColor: MD2DarkTheme.colors.primary, borderRadius: 10, padding: 5, paddingVertical: 10, maxWidth: 70 },
          ]}
          onPress={withTouch(() =>
            navigate("QRCode", {
              screen: "QRScanner",
            })
          )}
        >
          <>
            <FontAwesome name="qrcode" size={30} color={"#fff"} />
            {/* <Text style={[tabStyles.buttonLabel, { color: "#fff" }]}>{t("tabBar.join-game")}</Text> */}
          </>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={tabStyles.button} onPress={withTouch(() => navigate("Games"))}>
          <>
            <FontAwesome name="gamepad" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.games")}</Text>
          </>
        </TouchableOpacity>
      </BlurView>
    );
  },
  () => true
);

interface SectionProps {
  group: { name: string; results: Movie[] };
}

const sectionStyles = StyleSheet.create({
  container: { paddingHorizontal: 15, height: height * 0.275 + 30, paddingBottom: 30 },
  title: { color: "#fff", fontSize: 35, fontFamily: "Bebas", marginBottom: 10 },
  list: {
    flex: 1,
  },
  listContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },

  image: {
    width: width * 0.3,
    height: height * 0.2,
    borderRadius: 7.5,
    marginRight: 15,
  },
});

const keySectionExtractor = (item: any, index: number) => `${item.id}-${item.type || "movie"}-${index}`;

export const Section = memo(({ group }: SectionProps) => {
  const [page, setPage] = useState(1);
  const [getSectionMovies, state] = useLazyGetSectionMoviesQuery();

  const [movies, setSectionMovies] = useState<Movie[]>(() => group.results);

  const onEndReached = useCallback(() => {
    if (state.isLoading || !!state.error) return;
    setPage((prev) => prev + 1);
  }, [state.isLoading, state.error]);

  useEffect(() => {
    if (page === 1) return;

    getSectionMovies({ name: group.name, page }).then((response) => {
      if (response.data && Array.isArray(response.data.results)) {
        Promise.any(response.data.results.map((i) => prefetchThumbnail(i.poster_path, 185)));

        setSectionMovies((prev) => prev.concat(response?.data?.results || []));
      }
    });
  }, [page]);

  const renderItem = useCallback(({ item }: { item: Movie & { type: string } }) => <SectionListItem {...item} />, []);

  return (
    <Animated.View style={sectionStyles.container} entering={FadeIn}>
      <Text style={sectionStyles.title}>{group.name}</Text>
      <FlashList
        onEndReached={onEndReached}
        data={(movies || []) as any}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keySectionExtractor}
        renderItem={renderItem}
        estimatedItemSize={width * 0.3 + 15}
      />
    </Animated.View>
  );
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SectionListItem = (item: Movie) => {
  const navigation = useNavigation<any>();

  return (
    <AnimatedPressable
      entering={FadeIn}
      key={item.poster_path}
      onPress={async () => {
        navigation.navigate("MovieDetails", {
          id: item.id,
          type: item.type,
          img: item.poster_path,
        });
      }}
      style={{
        position: "relative",
      }}
    >
      <Thumbnail path={item.poster_path} size={185} container={sectionStyles.image} />
      <View style={{ position: "absolute", right: 20, bottom: 5 }}>
        <ScoreRing score={item.vote_average} />
      </View>
    </AnimatedPressable>
  );
};

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

const GameInviteSection = memo(
  ({
    type,
    navigation,
    backgroundMovies = [],
  }: {
    type: "quick" | "social" | "voter" | "fortune" | "all-games";
    navigation: any;
    backgroundMovies?: Movie[];
  }) => {
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
          {backgroundMovies.slice(0, 6).map((movie, index) => (
            <Thumbnail
              key={`${movie.id}-${index}`}
              path={movie.poster_path}
              size={185}
              container={gameInviteStyles.movieThumbnail}
              priority="low"
            />
          ))}
        </View>

        {/* Blur Overlay with Content */}
        <BlurView intensity={10} tint="dark" style={gameInviteStyles.blurContainer}>
          <Text style={gameInviteStyles.title}>{config.title}</Text>
          <Text style={gameInviteStyles.subtitle}>{config.subtitle}</Text>

          <TouchableOpacity style={gameInviteStyles.button} onPress={handleGamePress} activeOpacity={0.8}>
            <LinearGradient colors={gradientColors} style={gameInviteStyles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <FontAwesome name={config.icon as any} size={18} color="#fff" />
              <Text style={gameInviteStyles.buttonText}>{config.buttonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    );
  }
);
