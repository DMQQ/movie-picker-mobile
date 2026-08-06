import { Easing, withSpring, withTiming } from "react-native-reanimated";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const ModalEnteringTransition = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [
        { translateX: width + 150 },
        { translateY: 250 },
        { rotate: "20deg" },
        { scale: 0.8 },
      ],
    },
    animations: {
      opacity: withTiming(1, { duration: 250 }),
      transform: [
        {
          translateX: withTiming(0, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
          }),
        },
        {
          translateY: withTiming(0, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
          }),
        },
        {
          rotate: withSpring("0deg", {
            damping: 50,
            stiffness: 400,
            overshootClamping: false,
          }),
        },
        {
          scale: withSpring(1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    },
  };
};

export const ModalExitingTransition = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
      transform: [
        { translateX: 0 },
        { translateY: 0 },
        { rotate: "0deg" },
        { scale: 1 },
      ],
    },
    animations: {
      opacity: withTiming(0, { duration: 150 }),
      transform: [
        { translateX: withTiming(0, { duration: 200 }) },
        {
          translateY: withTiming(80, {
            duration: 200,
            easing: Easing.in(Easing.quad),
          }),
        },
        {
          rotate: withTiming("8deg", {
            duration: 200,
            easing: Easing.in(Easing.quad),
          }),
        },
        {
          scale: withTiming(0.5, {
            duration: 200,
            easing: Easing.in(Easing.back(1.2)),
          }),
        },
      ],
    },
  };
};
