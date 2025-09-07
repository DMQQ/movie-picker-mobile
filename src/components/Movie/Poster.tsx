import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  Easing,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import PlatformBlurView from "../PlatformBlurView";
import Thumbnail, { ThumbnailSizes } from "../Thumbnail";

const SwipeText = (props: {
  text: string;
  rotate: string;
  color: string;
  right: boolean;
  icon?: React.ReactNode;
  isVisible?: SharedValue<boolean>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!props.isVisible) return {};

    const isVisible = props.isVisible.value;

    return {
      opacity: withTiming(isVisible ? 1 : 0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      }),
      transform: [
        { rotate: props.rotate },
        {
          scale: withSpring(isVisible ? 1 : 0.8, {
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
          top: props.text === "LIKE" ? 40 : 60,
          right: props.right ? 25 : undefined,
          left: props.right ? undefined : 25,
        },
        styles.swipe,
      ]}
    >
      {/* BlurView background */}
      <PlatformBlurView
        intensity={80}
        tint="light"
        style={[
          styles.blurContainer,
          {
            backgroundColor: `${props.color}E6`, // Add transparency to the color
          },
        ]}
      >
        {/* Icon container with background circle */}
        <PlatformBlurView
          intensity={60}
          tint="light"
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
        </PlatformBlurView>

        <Text style={styles.swipeText}>{props.text}</Text>
      </PlatformBlurView>
    </Animated.View>
  );
};

export default function Poster(props: {
  card: {
    poster_path: string;
    placeholder_poster_path?: string;
  };
  translate?: SharedValue<{
    x: number;
    y: number;
  }>;

  isLeftVisible?: SharedValue<boolean>;

  isRightVisible?: SharedValue<boolean>;

  imageDimensions?: {
    height: number;
    width: number;
  };

  isSwipeable?: boolean;
}) {
  const { height, width } = useWindowDimensions();

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    if (!props.translate) return {};

    return {
      opacity: interpolate(props.translate.value.x, [-width / 1.5, 0, width / 1.5], [1, 0, 1]),
      backgroundColor: interpolateColor(
        props.translate.value.x,
        [-width, 0, width],
        ["rgba(255,0,0,0.6)", "rgba(0,0,0,0)", "rgba(0,255,0,0.6)"]
      ),
    };
  });

  const imageDimensions = props?.imageDimensions || {
    height: height * 0.675,
    width: width * 0.95 - 20,
  };

  return (
    <View style={{ position: "relative" }}>
      {props.isSwipeable && (
        <>
          <SwipeText
            icon={<Ionicons name="close" size={32} color="#fff" />}
            isVisible={props.isRightVisible}
            text="NOPE"
            color="#FF4458"
            rotate="30deg"
            right
          />

          <SwipeText
            icon={<Ionicons name="heart" size={32} color="#fff" style={{ transform: [{ translateY: 2 }] }} />}
            isVisible={props.isLeftVisible}
            text="LIKE"
            color="#42DCA3"
            rotate="-30deg"
            right={false}
          />
        </>
      )}

      <Animated.View
        style={[
          styles.overlay,
          {
            ...imageDimensions,
          },
          overlayAnimatedStyle,
        ]}
      />

      <Thumbnail
        path={props.card.poster_path}
        placeholder={props.card.placeholder_poster_path}
        size={ThumbnailSizes.poster.xxlarge}
        container={{ borderRadius: 19, ...imageDimensions }}
        style={{ borderRadius: 19, ...imageDimensions }}
      />
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
    borderRadius: 19,
    zIndex: 1,
    opacity: 0,
  },

  swipeText: {
    fontFamily: "Bebas",
    fontSize: 35,
    color: "#fff",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  swipe: {
    borderRadius: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    zIndex: 10,
    position: "absolute",
    overflow: "hidden", // Important for BlurView
  },

  blurContainer: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    minWidth: 120,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // Important for BlurView
  },
});
