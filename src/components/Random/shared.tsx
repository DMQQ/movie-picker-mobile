import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface RandomQuestionMarksProps {
  cardWidth: number;
  cardHeight: number;
}

export const RandomQuestionMarks = ({ cardWidth, cardHeight }: RandomQuestionMarksProps) => {
  return (
    <>
      {[...Array(7)].map((_, index) => {
        const segmentHeight = cardHeight / 7;
        const randomTop = index * segmentHeight + Math.random() * (segmentHeight - 30);
        const horizontalBias = index % 2 === 0 ? 0.1 : 0.5;
        const randomLeft = Math.random() * (cardWidth * 0.4) + cardWidth * horizontalBias;

        return (
          <MaterialCommunityIcons
            key={index}
            name="help"
            size={Math.trunc(Math.random() * 20 + 15)}
            color="rgba(255,255,255,0.15)"
            style={{
              position: "absolute",
              top: randomTop,
              left: randomLeft,
              transform: [{ rotate: `${Math.random() * 15}deg` }],
            }}
          />
        );
      })}
    </>
  );
};

interface ActionButtonsProps {
  onSuperLike: () => void;
  onBlock: () => void;
  superLikeLabel: string;
  blockLabel: string;
  superLikeIconScale?: Animated.SharedValue<number>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ActionButton = ({
  onPress,
  icon,
  label,
  color,
  bgColor,
  borderColor,
  iconScale,
}: {
  onPress: () => void;
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconScale?: Animated.SharedValue<number>;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale?.value ?? 1 }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      style={[styles.actionButton, { backgroundColor: bgColor, borderColor }, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={iconAnimatedStyle}>
        <Icon source={icon} size={16} color={color} />
      </Animated.View>
      <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
    </AnimatedPressable>
  );
};

export const ActionButtons = ({ onSuperLike, onBlock, superLikeLabel, blockLabel, superLikeIconScale }: ActionButtonsProps) => {
  return (
    <View style={styles.actionButtons}>
      <ActionButton
        onPress={onSuperLike}
        icon="star"
        label={superLikeLabel}
        color="#FFD700"
        bgColor="rgba(255, 215, 0, 0.15)"
        borderColor="rgba(255, 215, 0, 0.3)"
        iconScale={superLikeIconScale}
      />
      <ActionButton
        onPress={onBlock}
        icon="cancel"
        label={blockLabel}
        color="#FF4458"
        bgColor="rgba(255, 68, 88, 0.15)"
        borderColor="rgba(255, 68, 88, 0.3)"
      />
    </View>
  );
};


const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
