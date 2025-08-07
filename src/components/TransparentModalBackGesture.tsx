import { useNavigation } from "@react-navigation/native";
import { PropsWithChildren } from "react";
import { Platform, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import layout from "../utils/layout";

const TransparentModalScreen = ({ children }: PropsWithChildren<{}>) => {
  const translateX = useSharedValue(0);
  const navigation = useNavigation();
  const isValidGesture = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      isValidGesture.value = event.absoluteX <= 50;
    })
    .onUpdate((event) => {
      if (!isValidGesture.value) return;
      translateX.value = Math.max(0, event.translationX);
    })
    .onEnd((event) => {
      if (!isValidGesture.value) return;

      if (event.translationX > layout.screen.width / 2) {
        translateX.value = withTiming(1000, {}, () => {
          "worklet";
          runOnJS(navigation.goBack)();
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.content, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

const AndroidModalScreen = ({ children }: PropsWithChildren<{}>) => children;

export default Platform.OS === "ios" ? TransparentModalScreen : AndroidModalScreen;
