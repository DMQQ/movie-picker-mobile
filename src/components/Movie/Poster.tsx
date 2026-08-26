import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";

import Animated, {
  Easing,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Thumbnail, { ThumbnailSizes } from "../Thumbnail";
import { memo, useMemo } from "react";
import { Movie } from "../../../types";
import { Link } from "expo-router";
import { colors, fontSize, radius, spacing, typography} from "../../constants/design";
import useTranslation from "../../service/useTranslation";

const SwipeText = memo(
  (props: {
    text: string;
    rotate: string;
    color: string;
    right: boolean;
    icon?: React.ReactNode;
    isVisible?: SharedValue<boolean>;
  }) => {
    const { isVisible, rotate } = props;

    const animatedStyle = useAnimatedStyle(() => {
      if (!isVisible) return {};

      return {
        opacity: withTiming(isVisible.value ? 1 : 0, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        }),
        transform: [
          { rotate },
          {
            scale: withSpring(isVisible.value ? 1 : 0.8, {
              damping: 15,
              stiffness: 200,
            }),
          },
        ],
      };
    });

    return (
      <Animated.View
        style={[
          animatedStyle,
          {
            top: props.right ? 60 : 40,
            right: props.right ? 25 : undefined,
            left: props.right ? undefined : 25,
          },
          styles.swipe,
        ]}
      >
        {/* BlurView background */}
        <View
          style={[
            styles.blurContainer,
            {
              backgroundColor: `${props.color}E6`, // Add transparency to the color
            },
          ]}
        >
          {/* Icon container with background circle */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: "rgba(255,255,255,0.2)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              },
            ]}
          >
            {props.icon}
          </View>

          <Text style={styles.swipeText}>{props.text}</Text>
        </View>
      </Animated.View>
    );
  },
);

function Poster(props: {
  card: Movie & { isSuperLiked?: boolean };
  translateX?: SharedValue<number>;
  isLeftVisible?: SharedValue<boolean>;
  isRightVisible?: SharedValue<boolean>;
  imageDimensions?: {
    height: number;
    width: number;
  };
  isSwipeable?: boolean;
  link: boolean;
  href?: any;
}) {
  const { height, width } = useWindowDimensions();
  const t = useTranslation();

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    if (!props.translateX) return {};

    return {
      opacity: interpolate(
        props.translateX.value,
        [-width * 0.15, 0, width * 0.15],
        [1, 0, 1],
      ),
      backgroundColor: interpolateColor(
        props.translateX.value,
        [-width, 0, width],
        ["rgba(255,0,0,0.6)", "rgba(0,0,0,0)", "rgba(0,255,0,0.6)"],
      ),
    };
  });

  const imageDimensions = useMemo(
    () =>
      props?.imageDimensions || {
        height: height * 0.675,
        width: width * 0.95 - 20,
      },
    [height, width, props?.imageDimensions],
  );

  const thumbnail = (
    <Thumbnail
      transition={0}
      path={props.card.poster_path}
      size={ThumbnailSizes.poster.xxlarge}
      container={{ borderRadius: radius.modal - 1, ...imageDimensions }}
      style={{ borderRadius: radius.modal - 1, ...imageDimensions }}
    />
  );

  return (
    <View style={{ position: "relative" }}>
      {props.isSwipeable && (
        <>
          <SwipeText
            icon={
              <MaterialCommunityIcons
                name="thumb-down"
                size={32}
                color={colors.text}
              />
            }
            isVisible={props.isRightVisible}
            text={t("swipe.nope")}
            color="#FF4458"
            rotate="30deg"
            right
          />
          <SwipeText
            icon={
              <MaterialCommunityIcons
                name="thumb-up"
                size={32}
                color={colors.text}
                style={{ transform: [{ translateY: 2 }] }}
              />
            }
            isVisible={props.isLeftVisible}
            text={t("swipe.like")}
            color="#42DCA3"
            rotate="-30deg"
            right={false}
          />
        </>
      )}

      <Animated.View
        style={[
          styles.overlay,
          { ...imageDimensions },
          overlayAnimatedStyle,
        ]}
      />

      {props.link && props.href ? (
        <Link href={props.href} asChild>
          <Pressable>
            <Link.AppleZoom>{thumbnail}</Link.AppleZoom>
          </Pressable>
        </Link>
      ) : (
        thumbnail
      )}

      {props.card.isSuperLiked && (
        <View style={styles.superLikeBadge}>
          <MaterialCommunityIcons name="star" size={15} color={colors.appBackground} />
          <Text style={styles.superLikeText}>{t("swipe_tutorial.special_actions.super_like_label")}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.modal - 1,
    zIndex: 1,
    opacity: 0,
  },

  swipeText: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.section,
    color: colors.text,
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  swipe: {
    borderRadius: radius.modal,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    zIndex: 10,
    position: "absolute",
    overflow: "hidden",
    opacity: 0,
  },

  blurContainer: {
    borderRadius: radius.modal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    minWidth: 120,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.modal,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Important for BlurView
  },

  superLikeBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#FFD700",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    zIndex: 10,
    justifyContent: "center",
  },
  superLikeText: {
    fontFamily: "Bebas",
    color: colors.appBackground,
    fontSize: fontSize.lg,
  },
});

export default memo(Poster);
