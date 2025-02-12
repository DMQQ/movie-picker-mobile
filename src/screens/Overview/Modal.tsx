import LottieView from "lottie-react-native";
import { Fragment, useEffect, useRef, useState } from "react";
import { Dimensions, Platform, Pressable } from "react-native";
import { ActivityIndicator, MD2DarkTheme, Portal } from "react-native-paper";
import Animated, { FadeIn, FadeOut, withSpring, withTiming } from "react-native-reanimated";
import ScratchCard from "../../components/ScratchCard";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FancySpinner } from "../../components/FancySpinner";

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

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === "ios") {
    return <Fragment>{children}</Fragment>;
  }

  return (
    <Portal>
      <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
    </Portal>
  );
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Modal({ match, onClose }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const animation = useRef<LottieView>(null);
  const hasAnimationPlayed = useRef(false);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setIsLoading(false);
      animation.current?.play();
      hasAnimationPlayed.current = true;
    }, 750);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Wrapper>
      <AnimatedPressable
        onPress={onClose}
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
            zIndex: 100,
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
        <AnimatedPressable
          onPress={(e) => e.stopPropagation()}
          entering={ModalEnteringTransition}
          exiting={ModalExitingTransition}
          style={{
            borderWidth: 5,
            borderColor: MD2DarkTheme.colors.primary,
            borderRadius: 15,
            marginTop: Platform.OS === "ios" ? 50 : 150,
            position: "relative",
            zIndex: 1000,
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
              <FancySpinner />
            </Animated.View>
          )}
          <ScratchCard
            imageUrl={`https://image.tmdb.org/t/p/w500${match.poster_path}`}
            style={{
              width: Dimensions.get("screen").width - 30 - 15,
              height: Dimensions.get("window").height / 1.5 - 50,
            }}
          />
        </AnimatedPressable>
      </AnimatedPressable>
    </Wrapper>
  );
}
