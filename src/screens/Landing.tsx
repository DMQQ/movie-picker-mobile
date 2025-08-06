import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useState } from "react";
import { Dimensions, ImageBackground, Platform, Pressable, RefreshControl, StyleSheet, TouchableHighlight, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { Movie } from "../../types";
import AppLoadingOverlay from "../components/AppLoadingOverlay";
import FrostedGlass from "../components/FrostedGlass";
import NoConnectionError from "../components/NoConnectionError";
import RatingIcons from "../components/RatingIcons";
import ScoreRing from "../components/ScoreRing";
import Thumbnail, { prefetchThumbnail, ThumbnailSizes } from "../components/Thumbnail";
import { useGetFeaturedQuery, useLazyGetLandingPageMoviesQuery, useLazyGetSectionMoviesQuery } from "../redux/movie/movieApi";
import useTranslation from "../service/useTranslation";
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

const keyExtractor = (item: { name: string }, index: number) => item.name + "-" + index;

export default function Landing({ navigation }: ScreenProps<"Landing">) {
  const [page, setPage] = useState(0);

  const [data, setData] = useState<{ name: string; results: Movie[] }[]>([]);

  const [getLandingMovies, { error }] = useLazyGetLandingPageMoviesQuery();
  const [hasMore, setHasMore] = useState(true);

  const t = useTranslation();

  useEffect(() => {
    getLandingMovies({ skip: page * 5, take: 5 }).then((response) => {
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setHasMore(response.data.length >= 5);
        setData((prev) => {
          const uniqueSections = (response.data || []).filter(
            (newSection) => !prev.some((existingSection) => existingSection.name === newSection.name)
          );
          return [...prev, ...uniqueSections];
        });
      } else if (hasMore) {
        setPage((prev) => {
          return prev + 1;
        });
        setHasMore(false);
      }
    });
    console.log("Landing page movies fetched, current page:", page, "hasMore:", hasMore);
  }, [page, hasMore]);

  const onEndReached = useCallback(() => {
    setPage((prev) => {
      console.log("onEndReached called, current page:", prev + 1);
      return prev + 1;
    });
  }, []);

  const renderItem = useCallback(({ item: group }: { item: { name: string; results: Movie[] } }) => <Section group={group} />, []);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setData([]);
    getLandingMovies({ skip: 0, take: 5 }).then((response) => {
      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
      }
      setRefreshing(false);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppLoadingOverlay />

      <NoConnectionError />

      <FlashList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={<FeaturedSection navigate={navigation.navigate} />}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", height: height - 80 }}>
            <Text style={{ fontFamily: "Bebas", fontSize: 40 }}>{t("landing.error")}</Text>
          </View>
        }
        data={(data || []) as { name: string; results: Movie[] }[]}
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        renderItem={renderItem}
        onEndReachedThreshold={0.5}
        drawDistance={1000}
        estimatedItemSize={height * 0.275 + 30}
      />

      <BottomTab navigate={navigation.navigate} />
    </View>
  );
}

const FeaturedSection = memo(
  (props: { navigate: any }) => {
    const { data: featured, error } = useGetFeaturedQuery();

    const navigation = useNavigation<any>();
    const t = useTranslation();

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
      >
        <LinearGradient style={styles.gradientContainer} colors={gradient}>
          <Pressable onPress={onPress}>
            <FrostedGlass style={{ padding: 15 }}>
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
    gap: 15,
    paddingHorizontal: 10,
    paddingTop: 10,
    height: 70,
    paddingBottom: Platform.OS === "android" ? 10 : 0,
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

    const withTouch = (fn: () => void) => {
      return () => {
        if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        fn();
      };
    };

    return (
      <View style={tabStyles.container}>
        <TouchableHighlight
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          onPress={withTouch(() => navigate("Settings"))}
          style={tabStyles.button}
        >
          <>
            <FontAwesome name="gear" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.settings")}</Text>
          </>
        </TouchableHighlight>

        <TouchableHighlight
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          style={tabStyles.button}
          onPress={withTouch(() => navigate("Favourites"))}
        >
          <>
            <FontAwesome name="bookmark" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.favourites")}</Text>
          </>
        </TouchableHighlight>

        <TouchableHighlight
          activeOpacity={0.8}
          underlayColor={"#52287d"}
          style={[tabStyles.button, { backgroundColor: MD2DarkTheme.colors.primary, borderRadius: 10, padding: 5, paddingVertical: 10 }]}
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
        </TouchableHighlight>

        <TouchableHighlight
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          style={tabStyles.button}
          onPress={withTouch(() => navigate("Games"))}
        >
          <>
            <FontAwesome name="gamepad" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.games")}</Text>
          </>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={withTouch(() => navigate("Search"))}
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          style={tabStyles.button}
        >
          <>
            <FontAwesome name="search" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.search")}</Text>
          </>
        </TouchableHighlight>
      </View>
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
        Promise.any(
          response.data.results.map((i) =>
            [
              prefetchThumbnail(i.poster_path, ThumbnailSizes.poster.xxlarge),
              prefetchThumbnail(i.poster_path, ThumbnailSizes.poster.large),
            ].flat()
          )
        );

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
        onEndReachedThreshold={0.75}
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
