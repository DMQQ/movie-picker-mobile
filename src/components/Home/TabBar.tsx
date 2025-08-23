import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { Icon } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedButton = ({
  onPress,
  icon,
  color = "#fff",
  size = 25,
  isLike = false,
  isDislike = false,
}: {
  onPress: () => void;
  icon: string;
  color?: string;
  size?: number;
  isLike?: boolean;
  isDislike?: boolean;
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

  const getBackgroundColor = () => {
    if (isLike) return "#42DCA3";
    if (isDislike) return "#FF4458";
    return "rgba(255,255,255,0.15)";
  };

  const getBorderColor = () => {
    if (isLike) return "rgba(66, 220, 163, 0.8)";
    if (isDislike) return "rgba(255, 68, 88, 0.8)";
    return "rgba(255,255,255,0.3)";
  };

  const getShadowColor = () => {
    if (isLike) return "#42DCA3";
    if (isDislike) return "#FF4458";
    return "transparent";
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          borderRadius: 100,
          padding: 15,
          backgroundColor: getBackgroundColor(),
          borderWidth: isLike || isDislike ? 2 : 1,
          borderColor: getBorderColor(),
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          // Add glow effect for like/dislike buttons
          ...(isLike || isDislike
            ? {
                shadowColor: getShadowColor(),
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
      <Icon source={icon} size={size} color={isLike || isDislike ? "#fff" : color} />
    </AnimatedPressable>
  );
};

export default function TabBar(props: { likeCard: () => void; removeCard: () => void; openInfo: () => void; zIndex: number }) {
  const { width } = useWindowDimensions();

  return (
    <View
      style={[
        {
          position: "absolute",
          bottom: Platform.OS === "ios" ? -30 : 30,
          left: 10,
          width: width,
          flexDirection: "row",
          justifyContent: "center",
          gap: 20,
          zIndex: props.zIndex,
        },
      ]}
    >
      <AnimatedButton onPress={props.removeCard} icon="close" color="#fff" size={25} isDislike={true} />

      <AnimatedButton onPress={props.openInfo} icon="information-outline" color="#fff" size={25} />

      <AnimatedButton onPress={props.likeCard} icon="heart" color="#fff" size={25} isLike={true} />
    </View>
  );
}
