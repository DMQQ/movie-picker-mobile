import { Text, useTheme } from "react-native-paper";
import Card from "./Card";
import Poster from "./Poster";
import { Dimensions, Platform, Pressable, StyleSheet, Vibration } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp, withSpring, withTiming } from "react-native-reanimated";
import useTranslation from "../../service/useTranslation";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { getConstrainedDimensions } from "../../utils/getConstrainedDimensions";

const styles = StyleSheet.create({
  matchModal: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",

    ...StyleSheet.absoluteFillObject,
    height: getConstrainedDimensions("screen").height,
    zIndex: 1000,
  },
  matchText: {
    fontSize: 55,
    fontFamily: "Bebas",
    color: "#fff",
    marginTop: Platform.OS === "ios" ? 0 : 30,
  },
  matchCard: {
    justifyContent: "flex-start",
    position: "relative",
    height: "auto",
    marginTop: 15,
    minHeight: getConstrainedDimensions("screen").height / 1.5,
  },
  matchClose: {
    marginVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  gradient: {
    overflow: "hidden",
    width: getConstrainedDimensions("screen").width * 0.95 - 20,
    height: getConstrainedDimensions("screen").height * 0.7,
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 10,
    padding: 10,
    paddingBottom: 20,

    borderBottomRightRadius: 19,
    borderBottomLeftRadius: 19,
  },
  details: {
    color: "rgba(255,255,255,0.6)",
    paddingHorizontal: 10,
    fontWeight: "bold",
    marginTop: 5,
  },
});

export const ModalEnteringTransition = () => {
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

export const ModalExitingTransition = () => {
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

export default function MatchModal({ match, hideMatchModal }: { match: any; hideMatchModal: any }) {
  const theme = useTheme();
  const t = useTranslation();
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    if (match) {
      let timeout = setTimeout(() => {
        animation.current?.play();
        Vibration.vibrate([100]);
      }, 100);

      return () => {
        clearTimeout(timeout);
        Vibration.cancel();
      };
    }
  }, [match]);

  if (!match) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut.delay(200)} style={styles.matchModal}>
      <Pressable onPress={hideMatchModal}>
        <Animated.Text style={[styles.matchText]} entering={SlideInUp.delay(100)} exiting={SlideOutUp}>
          {t("match.title")} 🎉
        </Animated.Text>

        <LottieView
          ref={animation}
          style={{
            position: "absolute",
            width: getConstrainedDimensions("window").width,
            height: getConstrainedDimensions("window").height,
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
        />

        <Animated.View
          entering={ModalEnteringTransition}
          exiting={ModalExitingTransition}
          style={{
            marginTop: Platform.OS === "ios" ? 0 : 20,
          }}
        >
          <Card onPress={hideMatchModal}>
            <LinearGradient colors={["transparent", "transparent", theme.colors.primary]} style={styles.gradient}>
              <Text
                style={{
                  color: "white",
                  fontSize: 40,
                  paddingHorizontal: 10,
                  fontFamily: "Bebas",
                  lineHeight: 40,
                }}
              >
                {match.title || match.name}
              </Text>

              <Text style={styles.details}>
                {match.release_date || match.first_air_date} | {match.vote_average.toFixed(1)}/10
              </Text>
            </LinearGradient>

            <Poster
              imageDimensions={{
                width: getConstrainedDimensions("screen").width * 0.95 - 20,
                height: getConstrainedDimensions("screen").height * 0.7,
              }}
              card={match}
            />
          </Card>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
