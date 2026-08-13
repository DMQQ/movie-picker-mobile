import { LinearGradient } from "expo-linear-gradient";
import Text from "../Text";
import { memo, useMemo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Movie } from "../../../types";
import RatingIcons from "../RatingIcons";
import Poster from "./Poster";
import GenresView from "../GenresView";
import { colors, fontSize, radius, spacing } from "../../constants/design";

const { width, height } = Dimensions.get("window");

const CARD_TOP = height * (Platform.OS === "ios" ? 0.055 : 0.075);
// TabBar height + bottom offset + breathing room
const TAB_BAR_ZONE = Platform.OS === "ios" ? 85 : 150;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: width * 0.1 - 10,
    width: width * 0.9 - 20,
    height: height * 0.65,
    backgroundColor: colors.appBackground,
    borderRadius: radius.lg + 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  gradientContainer: {
    flex: 1,
    borderRadius: radius.modal - 1,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 10,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    paddingHorizontal: spacing.sm + 2,
    fontFamily: "Bebas",
  },
  overview: {
    color: "rgba(255,255,255,0.8)",
    paddingHorizontal: spacing.sm + 2,
    marginTop: spacing.xs + 1,
    fontSize: fontSize.lg,
  },
  release_date: {
    color: "rgba(255,255,255,0.6)",
    paddingHorizontal: spacing.sm + 2,
  },
  meta: {
    flexDirection: "row",
    marginTop: spacing.md,
    alignItems: "center",
    gap: spacing.sm - 2,
    flexWrap: "wrap",
    paddingLeft: spacing.sm + 2,
  },
});

interface SwipeCardProps {
  card: Movie;
  index: number;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  dragProgress: SharedValue<number>;
  isLeftVisible?: SharedValue<boolean>;
  isRightVisible?: SharedValue<boolean>;
  areaHeight: number;
}

const SwipeCard = ({
  card,
  index,
  translateX,
  translateY,
  dragProgress,
  isLeftVisible,
  isRightVisible,
  areaHeight,
}: SwipeCardProps) => {
  const isTop = index === 0;

  const dims = useMemo(
    () => ({
      width: width * 0.9 - 20,
      height:
        areaHeight > 0
          ? Math.min(height * 0.65, areaHeight - CARD_TOP - TAB_BAR_ZONE)
          : height * 0.65,
    }),
    [areaHeight],
  );

  const animatedStyle = useAnimatedStyle(() => {
    if (isTop) {
      const rotate = interpolate(
        translateX.value,
        [-width * 0.5, width * 0.5],
        [-15, 15],
        Extrapolation.CLAMP,
      );

      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotate}deg` },
        ],
        top: CARD_TOP,
        zIndex: 1000,
      };
    }

    const p = Math.min(Math.max(dragProgress.value, 0), 1);
    const baseY = index * -7.5;
    const baseScale = 1 - index * 0.05;

    return {
      transform: [
        { translateX: 0 },
        { translateY: baseY + p * 7.5 },
        { scale: baseScale + p * 0.05 },
      ],
      transformOrigin: "top center",
      top: CARD_TOP,
      zIndex: 1000 - index,
    };
  });

  return (
    <Animated.View
      style={[styles.container, dims, animatedStyle]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[
          "transparent",
          "transparent",
          "rgba(0,0,0,0.4)",
          "rgba(0,0,0,1)",
        ]}
        style={[styles.gradientContainer, dims]}
      >
        <Text style={styles.title}>{card?.title || card?.name}</Text>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: spacing.sm + 2,
          }}
        >
          <RatingIcons size={15} vote={card?.vote_average} />
        </View>
        {card.overview && (
          <Text style={styles.overview} numberOfLines={3}>
            {card.overview}
          </Text>
        )}
        <View style={styles.meta}>
          {card.genres ? (
            <GenresView genres={card.genres.slice(0, 3)} />
          ) : null}
          <Text style={styles.release_date}>
            {card.release_date || card.first_air_date}
          </Text>
        </View>
      </LinearGradient>

      <Poster
        link={false}
        isSwipeable={isTop}
        translateX={isTop ? translateX : undefined}
        isLeftVisible={isTop ? isLeftVisible : undefined}
        isRightVisible={isTop ? isRightVisible : undefined}
        imageDimensions={dims}
        card={card}
      />
    </Animated.View>
  );
};

export default memo(SwipeCard);
