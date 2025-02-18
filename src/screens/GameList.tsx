import { Dimensions, Image, ScrollView, View, StyleSheet, Animated } from "react-native";
import { IconButton, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import SafeIOSContainer from "../components/SafeIOSContainer";
import useTranslation from "../service/useTranslation";
import { useState, useRef } from "react";

const { width } = Dimensions.get("screen");
const CARD_HEIGHT = 280;

interface GameCardProps {
  title: string;
  description: string;
  images: any[];
  onPress: () => void;
  beta?: boolean;
  players?: string;
  duration?: string;
}

const GameCard = ({ title, description, images, onPress, beta, players, duration }: GameCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const theme = useTheme();

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
        <Image source={images[0]} style={styles.cardImage} resizeMode="cover" />

        <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.cardGradient}>
          <BlurView intensity={20} style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={{ width: "100%" }}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
              </View>
              {beta && (
                <View style={styles.betaBadge}>
                  <Text style={styles.betaText}>BETA</Text>
                </View>
              )}
            </View>

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
      images: [require("../assets/qr2.png")],
      route: "QRCode",
      players: "2-8",
      duration: "5-10 min",
      category: "popular",
    },
    {
      title: t("games.voter.title"),
      description: t("games.voter.description"),
      images: [require("../assets/voter1.png")],
      route: "Voter",
      params: { screen: "Home" },
      beta: true,
      players: "2",
      duration: "10-15 min",
      category: "new",
    },
    {
      title: "FortuneWheel",
      description: t("games.fortunewheel.description"),
      images: [require("../assets/fortunewheel.png")],
      route: "FortuneWheel",
      players: "1",
      duration: "5 min",
      category: "popular",
    },
  ];

  const filteredGames = selectedCategory === "all" ? games : games.filter((game) => game.category === selectedCategory);

  return (
    <SafeIOSContainer>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} style={styles.backButton} />
          <Text style={styles.headerTitle}>{t("voter.games")}</Text>
        </View>

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
            key={index}
            title={game.title}
            description={game.description}
            images={game.images}
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
    paddingTop: 8,
    paddingBottom: 16,
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
    height: CARD_HEIGHT / 1.5,
  },
  cardContent: {
    flex: 1,
    padding: 16,
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
    marginBottom: 4,
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
    borderRadius: 4,
    position: "absolute",
    right: 0,
  },
  betaText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardFooter: {
    flexDirection: "row",
    marginTop: 12,
  },
  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    color: "#fff",
    marginLeft: -4,
  },
});
