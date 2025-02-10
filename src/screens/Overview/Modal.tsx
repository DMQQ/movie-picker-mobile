import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Platform } from "react-native";
import { ActivityIndicator, MD2DarkTheme } from "react-native-paper";
import Animated, { FadeIn, FadeOut, withSpring, withTiming } from "react-native-reanimated";
import ScratchCard from "../../components/ScratchCard";

const ModalEnteringTransition = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [{ scale: 0.8 }, { translateY: 100 }],
    },
    animations: {
      opacity: withSpring(1),
      transform: [
        { scale: withSpring(1) },
        {
          translateY: withSpring(0, {
            damping: 12,
            stiffness: 90,
          }),
        },
      ],
    },
  };
};

const ModalExitingTransition = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
      transform: [{ scale: 1 }, { translateY: 0 }],
    },
    animations: {
      opacity: withTiming(0, { duration: 200 }),
      transform: [{ scale: withTiming(0.9) }, { translateY: withTiming(-50) }],
    },
  };
};

export default function Modal({ match }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const animation = useRef<LottieView>(null);
  const hasAnimationPlayed = useRef(false);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setIsLoading(false);
      animation.current?.play();
      hasAnimationPlayed.current = true;
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut.delay(200)}
      style={{
        ...Dimensions.get("window"),
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <LottieView
        ref={animation}
        style={{
          position: "absolute",
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
          top: -50,
          left: 0,
          zIndex: 10,
          pointerEvents: "none",
        }}
        autoPlay={false}
        loop={false}
        speed={1.25}
        resizeMode="cover"
        source={require("../../assets/confetti.json")}
        onAnimationFinish={() => {
          hasAnimationPlayed.current = true;
        }}
      />
      <Animated.View
        entering={ModalEnteringTransition}
        exiting={ModalExitingTransition}
        style={{
          borderWidth: 2,
          borderColor: MD2DarkTheme.colors.primary,
          borderRadius: 15,
          marginTop: Platform.OS === "ios" ? 50 : 100,
          position: "relative",
        }}
      >
        {isLoading && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={{
              position: "absolute",
              width: Dimensions.get("screen").width - 30 - 15,
              height: Dimensions.get("window").height / 1.5 - 50,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.7)",
              zIndex: 10,
              borderRadius: 13,
            }}
          >
            <ActivityIndicator color={MD2DarkTheme.colors.primary} size="large" />
          </Animated.View>
        )}
        <ScratchCard
          imageUrl={`https://image.tmdb.org/t/p/w500${match.poster_path}`}
          style={{
            width: Dimensions.get("screen").width - 30 - 15,
            height: Dimensions.get("window").height / 1.5 - 50,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}
