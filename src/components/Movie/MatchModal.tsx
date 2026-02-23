import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import Animated, { Easing, FadeIn, FadeOut, SlideInUp, SlideOutUp, withSpring, withTiming } from "react-native-reanimated";
import useTranslation from "../../service/useTranslation";
import Card from "./Card";
import Poster from "./Poster";
import RatingIcons from "../RatingIcons";
import { Movie } from "../../../types";
import ShareTicketButton from "../ShareTicketButton";
import GenresView from "../GenresView";

const styles = StyleSheet.create({
  matchModal: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.75)",

    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get("screen").height,
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
    minHeight: Dimensions.get("screen").height / 1.5,
  },
  matchClose: {
    marginVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  gradient: {
    overflow: "hidden",
    width: Dimensions.get("screen").width * 0.95 - 20,
    height: Dimensions.get("screen").height * 0.7,
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 10,
    paddingBottom: 20,
    borderBottomRightRadius: 19,
    borderBottomLeftRadius: 19,
  },
  details: {
    color: "#fff",
    paddingHorizontal: 10,
    marginTop: 5,
  },

  release_date: {
    color: "rgba(255,255,255,1)",
    paddingHorizontal: 10,
    marginTop: 5,
  },

  title: {
    color: "white",
    fontSize: 40,
    paddingHorizontal: 10,
    fontFamily: "Bebas",
    lineHeight: 40,
  },

  lottie: {
    position: "absolute",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    top: -50,
    left: 0,
    zIndex: 100,
    pointerEvents: "none",
  },

  meta: { flexDirection: "row", marginTop: 5, alignItems: "center", gap: 6, flexWrap: "wrap", paddingLeft: 10 },

  share: { position: "absolute", bottom: -75, right: 0, left: 0, zIndex: 20, justifyContent: "center", alignItems: "center" },
});

const { width } = Dimensions.get("window");

export const ModalEnteringTransition = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateX: width + 150 }, { translateY: 250 }, { rotate: "20deg" }, { scale: 0.8 }],
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
      transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: "0deg" }, { scale: 1 }],
    },

    animations: {
      opacity: withTiming(0, { duration: 150 }),
      transform: [
        {
          translateX: withTiming(0, { duration: 200 }),
        },
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

export default function MatchModal({ match, hideMatchModal }: { match: Movie | undefined; hideMatchModal: VoidFunction }) {
  const theme = useTheme();
  const t = useTranslation();
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    if (!match) return;

    let timeout = setTimeout(() => {
      animation.current?.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [match]);

  if (!match) return null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut.delay(200)} style={styles.matchModal}>
      <Pressable onPress={hideMatchModal}>
        <Animated.Text style={[styles.matchText]} entering={SlideInUp.delay(100)} exiting={SlideOutUp}>
          {t("match.title")} 🎉
        </Animated.Text>

        <LottieView
          key={match.id}
          ref={animation}
          style={styles.lottie}
          autoPlay={!!match}
          loop={false}
          speed={1}
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
          <Card>
            <LinearGradient colors={["transparent", "transparent", theme.colors.surface]} style={styles.gradient}>
              <Text style={styles.title}>{match.title || match.name}</Text>

              <View style={{ flexDirection: "row", paddingHorizontal: 10, marginBottom: 5 }}>
                <RatingIcons size={15} vote={match?.vote_average} />
              </View>

              <View style={styles.meta}>
                {match.genres ? <GenresView genres={match.genres.slice(0, 3)} /> : null}
                <Text style={styles.release_date}>{match.release_date || match.first_air_date}</Text>
              </View>
            </LinearGradient>

            <Poster
              imageDimensions={{
                width: Dimensions.get("screen").width * 0.95 - 20,
                height: Dimensions.get("screen").height * 0.7,
              }}
              card={match}
            />
          </Card>
        </Animated.View>
        <Animated.View exiting={FadeOut} style={styles.share}>
          <ShareTicketButton movie={match} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
