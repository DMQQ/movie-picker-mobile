import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { Icon, Text } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "default" | "like" | "dislike" | "block" | "superLike";

const BUTTON_COLORS: Record<ButtonVariant, { bg: string; border: string; shadow: string }> = {
  default: { bg: "rgba(255,255,255,0.15)", border: "rgba(255,255,255,0.3)", shadow: "transparent" },
  like: { bg: "#42DCA3", border: "rgba(66, 220, 163, 0.8)", shadow: "#42DCA3" },
  dislike: { bg: "#FF4458", border: "rgba(255, 68, 88, 0.8)", shadow: "#FF4458" },
  block: { bg: "#8B0000", border: "rgba(139, 0, 0, 0.8)", shadow: "#8B0000" },
  superLike: { bg: "#FFD700", border: "rgba(255, 215, 0, 0.8)", shadow: "#FFD700" },
};

const AnimatedButton = ({
  onPress,
  icon,
  color = "#fff",
  size = 25,
  variant = "default",
  text,
  label,
  small = false,
}: {
  onPress: () => void;
  icon?: string;
  color?: string;
  size?: number;
  variant?: ButtonVariant;
  text?: string;
  label?: string;
  small?: boolean;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const colors = BUTTON_COLORS[variant];
  const isAccent = variant !== "default";

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          animatedStyle,
          {
            borderRadius: 100,
            padding: small ? 10 : 15,
            paddingHorizontal: small ? 15 : 25,
            backgroundColor: colors.bg,
            borderWidth: isAccent ? 2 : 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",

            ...(isAccent
              ? {
                  shadowColor: colors.shadow,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                }
              : {}),
          },
        ]}
      >
        {icon && <Icon source={icon} size={small ? 18 : size} color={isAccent ? "#fff" : color} />}
        {text && (
          <Text
            style={{
              color: isAccent ? "#fff" : color,
              fontSize: 15,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            {text}
          </Text>
        )}
      </AnimatedPressable>
      {label && (
        <Text
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 10,
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

interface TabBarProps {
  likeCard: () => void;
  removeCard: () => void;
  openInfo: () => void;
  zIndex: number;
  blockCard?: () => void;
  superLikeCard?: () => void;
  labels?: {
    block?: string;
    dislike?: string;
    like?: string;
    superLike?: string;
  };
}

export default function TabBar(props: TabBarProps) {
  const { width } = useWindowDimensions();

  return (
    <View
      style={[
        {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 0 : 30,
          left: 10,
          width: width,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          zIndex: props.zIndex,
        },
      ]}
    >
      {props.blockCard && (
        <AnimatedButton onPress={props.blockCard} icon="cancel" size={18} variant="block" small label={props.labels?.block ?? "Block"} />
      )}

      <AnimatedButton
        onPress={props.removeCard}
        icon="close"
        color="#fff"
        size={25}
        variant="dislike"
        label={props.labels?.dislike ?? "Nope"}
      />

      <AnimatedButton onPress={props.likeCard} icon="heart" color="#fff" size={25} variant="like" label={props.labels?.like ?? "Like"} />

      {props.superLikeCard && (
        <AnimatedButton
          onPress={props.superLikeCard}
          icon="star"
          size={18}
          variant="superLike"
          small
          label={props.labels?.superLike ?? "Super"}
        />
      )}
    </View>
  );
}
