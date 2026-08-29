import { Pressable, useWindowDimensions, View } from "react-native";
import Touch from "../../components/Touch";
import Text from "../../components/Text";

import { colors, fontSize, radius, spacing } from "../../constants/design";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { ImageBackground } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { EdgeInsets } from "react-native-safe-area-context";
import RatingIcons from "../../components/RatingIcons";
import { FancySpinner } from "../../components/FancySpinner";
import useTranslation from "../../service/useTranslation";

const STAR_COLORS = ["#E5484D", "#F76B15", "#9ACD32", "#46A758", "#FFD700"];

function AnimatedStar({
  scale,
  starColor,
  starWidth,
  starFontSize,
}: {
  scale: ReturnType<typeof useSharedValue<number>>;
  starColor: string;
  starWidth: number;
  starFontSize: number;
}) {
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View style={{ width: starWidth, alignItems: "center", justifyContent: "center" }}>
      <Animated.Text style={[{ fontSize: starFontSize, color: starColor }, animStyle]}>★</Animated.Text>
    </View>
  );
}

// card horizontal insets: marginHorizontal spacing.screen + paddingHorizontal spacing.lg
const CARD_H_INSET = (spacing.screen + spacing.lg) * 2;

function StarRow({
  ratingKey,
  label,
  emoji,
  localRatings,
  setLocalRatings,
}: {
  ratingKey: "interest" | "mood" | "uniqueness";
  label: string;
  emoji: string;
  localRatings: { interest: number | null; mood: number | null; uniqueness: number | null };
  setLocalRatings: React.Dispatch<
    React.SetStateAction<{ interest: number | null; mood: number | null; uniqueness: number | null }>
  >;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const starWidth = Math.floor(((screenWidth - CARD_H_INSET) * 0.55) / 5);
  const starFontSize = Math.round(starWidth * 0.78);

  const s1 = useSharedValue(0);
  const s2 = useSharedValue(0);
  const s3 = useSharedValue(0);
  const s4 = useSharedValue(0);
  const s5 = useSharedValue(0);
  const scales = [s1, s2, s3, s4, s5];

  const filledCount = localRatings[ratingKey] ?? 0;

  const animateSelection = (selected: number) => {
    scales.forEach((s, i) => {
      if (i < selected) {
        s.value = withDelay(
          i * 70,
          selected === 5
            ? withSpring(1, { damping: 10, stiffness: 260 })
            : withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
        );
      } else {
        s.value = withTiming(0, { duration: 100 });
      }
    });
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 }}>
        <Text style={{ fontSize: starFontSize * 0.65, lineHeight: starFontSize }}>{emoji}</Text>
        <Text
          style={{
            fontFamily: "Bebas",
            fontSize: starFontSize * 0.6,
            lineHeight: starFontSize,
            color: localRatings[ratingKey] !== null ? colors.text : "rgba(255,255,255,0.5)",
            letterSpacing: 0.5,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <View>
        {/* Static gray stars — tap targets, never animated */}
        <View style={{ flexDirection: "row" }}>
          {([1, 2, 3, 4, 5] as const).map((star) => (
            <Pressable
              key={star}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLocalRatings((p) => ({ ...p, [ratingKey]: star }));
                animateSelection(star);
              }}
              style={{ width: starWidth, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: starFontSize, color: "rgba(255,255,255,0.15)" }}>★</Text>
            </Pressable>
          ))}
        </View>
        {/* Animated colored stars on top of the gray ones */}
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, flexDirection: "row" }}
        >
          {([1, 2, 3, 4, 5] as const).map((star, i) => (
            <AnimatedStar key={star} scale={scales[i]} starColor={STAR_COLORS[Math.max(0, filledCount - 1)]} starWidth={starWidth} starFontSize={starFontSize} />
          ))}
        </View>
      </View>
    </View>
  );
}

const scaleTitle = (title: string, size = 30) => {
  if (title.length > 30) return size * 0.75;
  if (title.length > 20) return size * 0.85;
  return size;
};


const COUNTDOWN_MS = 10_000;

interface Props {
  card: any;
  currentMovies: any[];
  insets: EdgeInsets;
  localRatings: { interest: number | null; mood: number | null; uniqueness: number | null };
  setLocalRatings: React.Dispatch<
    React.SetStateAction<{
      interest: number | null;
      mood: number | null;
      uniqueness: number | null;
    }>
  >;
  onTimeout: () => void;
}

export default function RatingState({
  card,
  currentMovies,
  insets,
  localRatings,
  setLocalRatings,
  onTimeout,
}: Props) {
  const t = useTranslation();
  const countdownProgress = useSharedValue(1);

  useEffect(() => {
    countdownProgress.value = 1;
    countdownProgress.value = withTiming(0, { duration: COUNTDOWN_MS, easing: Easing.linear });
    const timer = setTimeout(onTimeout, COUNTDOWN_MS);
    return () => clearTimeout(timer);
  }, [card?.id]);

  const countdownBarStyle = useAnimatedStyle(() => ({
    width: `${countdownProgress.value * 100}%`,
    backgroundColor: interpolateColor(
      countdownProgress.value,
      [0, 0.4, 1],
      ["#E5484D", "#FFD700", "#46A758"],
    ),
  }));
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const posterHeight = Math.min(screenHeight * 0.5, screenWidth * 0.75);
  const posterWidth = posterHeight * (2 / 3);

  if (!card) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: spacing.screen,
        }}
      >
        <FancySpinner />
        <Text>{t("voter.home.waiting")}</Text>
      </View>
    );
  }

  const ratingRows = [
    { key: "interest" as const, label: t("voter.ratings.interest.label"), emoji: "🔥" },
    { key: "mood" as const, label: t("voter.ratings.mood.label"), emoji: "🎭" },
    { key: "uniqueness" as const, label: t("voter.ratings.novelty.label"), emoji: "✨" },
  ] as const;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: -insets.top,
        left: 0,
        right: 0,
        bottom: -insets.bottom,
      }}
      key={card.id}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <ImageBackground
        blurRadius={5}
        source={{ uri: "https://image.tmdb.org/t/p/w500" + card?.backdrop_path }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: spacing.screen,
              paddingTop: insets.top + 5,
              paddingBottom: spacing.sm,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 30, fontFamily: "Bebas" }}>
              {(t("voter.home.ratingHeadings") as unknown as string[])[card.id % 15]}
            </Text>
            <Text style={{ fontFamily: "Bebas", fontSize: fontSize.xxl }}>
              {currentMovies.length} {t("voter.home.left")}
            </Text>
          </View>

          {/* Countdown bar */}
          <View style={{ height: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <Animated.View style={[{ height: 3 }, countdownBarStyle]} />
          </View>

          {/* Poster — flex:1 so it fills whatever vertical space remains above the rating rows */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.screen }}>
            <Touch
              disabled={typeof card?.id === "undefined"}
              onPress={() =>
                router.push({
                  pathname: "/movie/type/[type]/[id]",
                  params: {
                    id: card?.id,
                    type: card?.title ? "movie" : "tv",
                    source: "voter",
                    img: card?.poster_path,
                  },
                })
              }
              style={{ width: posterWidth, height: posterHeight, borderRadius: radius.md, overflow: "hidden" }}
            >
              <Animated.Image
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                source={{
                  uri: "https://image.tmdb.org/t/p/w500" + card?.poster_path,
                }}
                style={{ width: "100%", height: "100%", borderRadius: radius.md }}
                resizeMode="cover"
              />
            </Touch>

            <Text
              style={{
                fontSize: scaleTitle((card?.title || card?.name)! as string, 34),
                fontFamily: "Bebas",
                textAlign: "center",
                marginTop: spacing.sm,
              }}
            >
              {card?.title || card?.name}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm - 2,
                marginTop: spacing.xs - 1,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <RatingIcons vote={card.vote_average} size={14} />
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: fontSize.sm }}>
                {[
                  card?.release_date?.slice(0, 4),
                  card?.original_language?.toUpperCase(),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>

            <Text
              numberOfLines={2}
              style={{
                marginTop: spacing.xs + 2,
                color: "rgba(255,255,255,0.75)",
                fontSize: fontSize.lg,
                textAlign: "center",
                lineHeight: 23,
              }}
            >
              {card?.overview}
            </Text>
          </View>

          {/* Rating section */}
          <View
            style={{
              marginHorizontal: spacing.screen,
              marginBottom: insets.bottom + 10,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              gap: spacing.xxl + 4,
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: radius.modal,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            {ratingRows.map(({ key, label, emoji }) => (
              <StarRow
                key={key}
                ratingKey={key}
                label={label}
                emoji={emoji}
                localRatings={localRatings}
                setLocalRatings={setLocalRatings}
              />
            ))}
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}
