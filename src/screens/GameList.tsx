import { Dimensions, Image, ScrollView, View, StyleSheet, Animated } from "react-native";
import { IconButton, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import SafeIOSContainer from "../components/SafeIOSContainer";
import useTranslation from "../service/useTranslation";
import { useState, useRef } from "react";

import CardSwiperAnimation from "../components/GameListAnimations/SwipeAnimation";
import SwiperAnimation from "../components/GameListAnimations/SwipeAnimation";
import VoterAnimation from "../components/GameListAnimations/VoterAnimation";
import FortuneWheelAnimation from "../components/GameListAnimations/FortuneWheelAnimation";
import PageHeading from "../components/PageHeading";
import { useGetCategoriesQuery } from "../redux/movie/movieApi";
// import FortuneWheelAnimation from "../components/GameListAnimations/FortuneWheelAnimation";

const { width } = "screen";
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

const GameCard = ({ title, description, onPress, beta, players, duration, index }: GameCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  useGetCategoriesQuery({});

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableRipple onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.cardContainer}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {Animations[index]}

        <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.cardGradient}>
          <BlurView intensity={20} style={styles.cardContent}>
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
          </BlurView>
        </LinearGradient>
      </Animated.View>
    </TouchableRipple>
  );
};

export default function GameList() {
  const navigation = useNavigation<any>();
  const t = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      players: "2-8",
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
      duration: "10-15 min",
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

  const filteredGames = selectedCategory === "all" ? games : games.filter((game) => game.category === selectedCategory);

  return (
    <SafeIOSContainer>
      <View style={styles.header}>
        <PageHeading title={t("voter.games")} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableRipple
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>{category.label}</Text>
            </TouchableRipple>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {filteredGames.map((game, index) => (
          <GameCard
            index={game.index}
            key={game.index}
            title={game.title}
            description={game.description}
            onPress={() => navigation.navigate(game.route, game.params)}
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
    paddingHorizontal: 15,
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
