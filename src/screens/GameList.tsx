import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text, TouchableRipple } from "react-native-paper";
import SafeIOSContainer from "../components/SafeIOSContainer";
import useTranslation from "../service/useTranslation";
import { router } from "expo-router";

import Animated, { FadeInDown } from "react-native-reanimated";
import FortuneWheelAnimation from "../components/GameListAnimations/FortuneWheelAnimation";
import SwiperAnimation from "../components/GameListAnimations/SwipeAnimation";
import VoterAnimation from "../components/GameListAnimations/VoterAnimation";
import PageHeading from "../components/PageHeading";
import { useLazyGetAllProvidersQuery, useLazyGetCategoriesQuery, useLazyGetGenresQuery } from "../redux/movie/movieApi";
import { ScreenProps } from "./types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("screen");
const CARD_HEIGHT = 280;

interface GameCardProps {
  title: string;
  description: string;
  onPress: () => void;
  beta?: boolean;
  players?: string;
  duration?: string;

  index: number;
}

const Animations = [<SwiperAnimation />, <VoterAnimation />, <FortuneWheelAnimation />];

const AnimatedRipple = Animated.createAnimatedComponent(TouchableRipple);

const GameCard = ({ title, description, onPress, beta, players, duration, index }: GameCardProps) => {
  return (
    <AnimatedRipple onPress={onPress} style={styles.cardContainer} exiting={FadeInDown.delay((index + 1) * 75)}>
      <Animated.View style={[styles.card]}>
        {Animations[index]}

        <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.cardGradient}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={{ width: "100%" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.cardTitle}>{title}</Text>
                  <View style={styles.cardFooter}>
                    {players && (
                      <View style={styles.cardDetail}>
                        <IconButton icon="account-group" size={20} />
                        <Text style={styles.detailText}>{players}</Text>
                      </View>
                    )}
                    {duration && (
                      <View style={styles.cardDetail}>
                        <IconButton icon="clock-outline" size={20} />
                        <Text style={styles.detailText}>{duration}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.cardDescription}>{description}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </AnimatedRipple>
  );
};

export default function GameList() {
  const t = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [prefetchProviders] = useLazyGetAllProvidersQuery();
  const [prefetchSections] = useLazyGetCategoriesQuery();
  const [prefetchGengres] = useLazyGetGenresQuery();

  useEffect(() => {
    Promise.all([prefetchProviders({}), prefetchSections({}), prefetchGengres({ type: "movie" }), prefetchGengres({ type: "tv" })]);
  }, []);

  const categories = [
    { id: "all", label: t("games.categories.all") },
    { id: "popular", label: t("games.categories.popular") },
    { id: "new", label: t("games.categories.new") },
  ];

  const games = [
    {
      title: t("games.voter.swipe"),
      description: t("games.voter.swipeDescription"),

      route: "QRCode",
      players: "1-8",
      duration: "5-10 min",
      category: "popular",
      index: 0,
    },
    {
      title: t("games.voter.title"),
      description: t("games.voter.description"),

      route: "Voter",
      params: { screen: "Home" },
      beta: true,
      players: "2",
      duration: "5-10 min",
      category: "new",
      index: 1,
    },
    {
      title: "FortuneWheel",
      description: t("games.fortunewheel.description"),

      route: "Fortune",
      players: "1",
      duration: "5 min",
      category: "popular",
      index: 2,
    },
  ];
  const insets = useSafeAreaInsets();

  const filteredGames = selectedCategory === "all" ? games : games.filter((game) => game.category === selectedCategory);

  return (
    <SafeIOSContainer>
      <PageHeading
        title={t("voter.games")}
        styles={
          Platform.OS === "android" && {
            marginTop: insets.top + 30,
          }
        }
      />

      <ScrollView
        style={[styles.container, Platform.OS === "android" && { marginTop: 30 }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 60 }}
      >
        {filteredGames.map((game, index) => (
          <GameCard
            index={game.index}
            key={game.index}
            title={game.title}
            description={game.description}
            onPress={() => router.push({ pathname: game.route, params: game.params })}
            beta={game.beta}
            players={game.players}
            duration={game.duration}
          />
        ))}
      </ScrollView>
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    position: "relative",
  },
  backButton: {
    marginRight: 8,
    position: "absolute",
    left: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginLeft: 40,
    marginRight: 40,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#fff",
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#000",
  },
  cardContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 7.5,
    justifyContent: "flex-end",
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontFamily: "Bebas",
    fontSize: 28,
    color: "#fff",
  },
  cardDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "90%",
  },
  betaBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    position: "absolute",
    top: 10,
    left: 10,
  },
  betaText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardFooter: {
    flexDirection: "row",
    marginTop: -5,
  },
  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  detailText: {
    color: "#fff",
    marginLeft: -4,
  },
});
