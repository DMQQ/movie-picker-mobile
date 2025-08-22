import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useState } from "react";
import { Dimensions, Platform, RefreshControl, StyleSheet, TouchableOpacity, View, VirtualizedList } from "react-native";
import { ActivityIndicator, MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../types";
import AppLoadingOverlay from "../components/AppLoadingOverlay";
import FeaturedSection from "../components/Landing/FeaturedSection";
import LandingHeader from "../components/LandingHeader";
import NoConnectionError from "../components/NoConnectionError";
import SectionListItem from "../components/SectionItem";
import Thumbnail, { prefetchThumbnail } from "../components/Thumbnail";
import { useLazyGetSectionMoviesQuery } from "../redux/movie/movieApi";
import useLanding, { SectionData } from "../service/useLanding";
import useTranslation from "../service/useTranslation";
import { ScreenProps } from "./types";

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

export default function Landing({ navigation }: ScreenProps<"Landing">) {
  const { data, onScroll, onEndReached, refreshing, onRefresh, getItemLayout, handleChipPress, selectedChip, scrollY, hasMore } =
    useLanding();

  const renderItem = useCallback(({ item }: { item: SectionData }) => {
    if ("type" in item && item.type === "game") {
      return <GameInviteSection type={item.gameType} navigation={navigation} />;
    }

    return <Section group={item} />;
  }, []);

  const t = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <AppLoadingOverlay />
      <NoConnectionError />

      <AnimatedVirtualizedList
        initialNumToRender={3}
        onScroll={onScroll}
        data={data}
        renderItem={renderItem as any}
        keyExtractor={keyExtractor}
        getItemCount={getItemCount}
        getItem={getItem}
        onEndReached={onEndReached}
        ListHeaderComponent={<FeaturedSection navigate={navigation.navigate} />}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        getItemLayout={getItemLayout}
        style={{ flex: 1 }}
        ListFooterComponent={
          <View style={{ height: 100 }}>
            {hasMore ? (
              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", flex: 1, gap: 10 }}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={{ textAlign: "center", color: "#fff" }}>{t("landing.list_footer")}...</Text>
              </View>
            ) : (
              <View>
                <Text style={{ textAlign: "center", color: "#fff" }}>{t("landing.no_more_results")}</Text>
              </View>
            )}
          </View>
        }
      />

      <BottomTab navigate={navigation.navigate} />
      <LandingHeader selectedChip={selectedChip} onChipPress={handleChipPress} scrollY={scrollY} />
    </View>
  );
}

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
  container: { paddingHorizontal: 15, height: Math.min(width * 0.25, 200) * 1.75 + 50, paddingBottom: 50 },
  title: { color: "#fff", fontSize: 35, fontFamily: "Bebas", marginBottom: 10 },
  list: {
    flex: 1,
  },
  listContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

const keySectionExtractor = (item: any, index: number) => `${item.id}-${item.type || "movie"}-${index}`;

export const Section = memo(({ group }: SectionProps) => {
  const navigation = useNavigation<any>();
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
        Promise.allSettled(response.data.results.map((i) => prefetchThumbnail(i.poster_path, 185)));

        setSectionMovies((prev) => prev.concat(response?.data?.results || []));
      }
    });
  }, [page]);

  const renderItem = useCallback(
    ({ item }: { item: Movie & { type: string } }) => (
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
    ),
    []
  );

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
        estimatedItemSize={Math.min(width * 0.25, 200)}
      />
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
