import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";
import PlatformBlurView from "../PlatformBlurView";
import { router } from "expo-router";

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
  ({ type }: { type: "quick" | "social" | "voter" | "fortune" | "all-games" }) => {
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
            navigation: () => router.push("/games"),
          };
        case "social":
          return {
            title: t("game-invite.social-title"),
            subtitle: t("game-invite.social-subtitle"),
            buttonText: t("game-invite.social-button"),
            colors: ["#f59e0b", "#ef4444"] as const,
            icon: "users",
            navigation: () =>
              router.push({
                pathname: "/room/qr-code",
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
            navigation: () => router.push("/voter-home"),
          };
        case "fortune":
          return {
            title: t("game-invite.fortune-title"),
            subtitle: t("game-invite.fortune-subtitle"),
            buttonText: t("game-invite.fortune-button"),
            colors: ["#8b5cf6", "#7c3aed"] as const,
            icon: "refresh",
            navigation: () => router.push("/fortune"),
          };
        case "all-games":
          return {
            title: t("game-invite.all-games-title"),
            subtitle: t("game-invite.all-games-subtitle"),
            buttonText: t("game-invite.all-games-button"),
            colors: ["#374151", "#6b7280"] as const,
            icon: "list",
            navigation: () => router.push("/games"),
          };
        default:
          return {
            title: "",
            subtitle: "",
            buttonText: "",
            colors: ["#6366f1", "#8b5cf6"] as const,
            icon: "gamepad",
            navigation: () => router.push("/games"),
          };
      }
    };

    const config = getGameConfig(type);

    const handleGamePress = useCallback(() => {
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      config.navigation();
    }, [type]);

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
        <PlatformBlurView intensity={10} tint="dark" style={gameInviteStyles.blurContainer}>
          <Text style={gameInviteStyles.title}>{config.title}</Text>
          <Text style={gameInviteStyles.subtitle}>{config.subtitle}</Text>

          <TouchableOpacity style={gameInviteStyles.button} onPress={handleGamePress} activeOpacity={0.8}>
            <LinearGradient colors={gradientColors} style={gameInviteStyles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <FontAwesome name={config.icon as any} size={18} color="#fff" />
              <Text style={gameInviteStyles.buttonText}>{config.buttonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </PlatformBlurView>
      </Animated.View>
    );
  }
);

export default GameInviteSection;
