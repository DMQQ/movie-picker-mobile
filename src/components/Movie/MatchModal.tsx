import * as Haptics from "expo-haptics";
import Text from "../Text";
import { useTheme } from "../../hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { colors, radius, spacing } from "../../constants/design";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from "react-native-reanimated";
import useTranslation from "../../service/useTranslation";
import Card from "./Card";
import Poster from "./Poster";
import RatingIcons from "../RatingIcons";
import { Movie } from "../../../types";
import ShareTicketButton from "../ShareTicketButton";
import GenresView from "../GenresView";
import LikedByAvatars from "./LikedByAvatars";
import {
  ModalEnteringTransition,
  ModalExitingTransition,
} from "./matchTransitions";

export { ModalEnteringTransition, ModalExitingTransition };

const AUTO_DISMISS_MS = 5000;

const styles = StyleSheet.create({
  matchModal: {
    padding: spacing.xl,
    borderRadius: radius.modal,
    backgroundColor: "rgba(0,0,0,0.75)",
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  matchText: {
    fontSize: 55,
    fontFamily: "Bebas",
    color: colors.text,
    marginTop: Platform.OS === "ios" ? 0 : 30,
  },
  gradient: {
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 10,
    paddingBottom: spacing.xl,
    borderBottomRightRadius: 19,
    borderBottomLeftRadius: 19,
  },
  release_date: {
    color: "rgba(255,255,255,1)",
    paddingHorizontal: spacing.sm + 2,
    marginTop: spacing.xs + 1,
  },
  title: {
    color: colors.text,
    fontSize: 40,
    paddingHorizontal: spacing.sm + 2,
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
  meta: {
    flexDirection: "row",
    marginTop: spacing.xs + 1,
    alignItems: "center",
    gap: spacing.sm - 2,
    flexWrap: "wrap",
    paddingLeft: spacing.sm + 2,
  },
  share: {
    position: "absolute",
    bottom: -75,
    right: 0,
    left: 0,
    zIndex: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function MatchModal({
  match,
  hideMatchModal,
  likedBy,
  totalUsers,
  didLike,
}: {
  match: Movie | undefined;
  hideMatchModal: VoidFunction;
  likedBy?: { userId: string; username: string }[];
  totalUsers?: number;
  didLike?: boolean;
}) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const cardWidth = windowWidth * 0.95 - 20;
  const cardHeight = windowHeight * 0.68;
  const theme = useTheme();
  const t = useTranslation();
  const animation = useRef<LottieView>(null);
  const isPartial = !!likedBy;

  useEffect(() => {
    if (!match) return;

    if (isPartial) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const timer = setTimeout(hideMatchModal, AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    }

    const timeout = setTimeout(() => {
      animation.current?.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 100);
    return () => clearTimeout(timeout);
    // hideMatchModal intentionally omitted — stable dispatch reference, timer depends on match id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id, isPartial]);

  if (!match) return null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut.delay(200)}
      style={styles.matchModal}
    >
      <Pressable onPress={hideMatchModal}>
        <Animated.Text
          style={[styles.matchText, isPartial && { color: theme.colors.accent }]}
          entering={SlideInUp.delay(100)}
          exiting={SlideOutUp}
        >
          {isPartial ? (t("partial-match.title") as string) : `${t("match.title")} 🎉`}
        </Animated.Text>

        {isPartial && didLike === false && (
          <Animated.Text
            style={[styles.matchText, { color: theme.colors.primary, fontSize: 36, marginTop: spacing.xs - 2 }]}
            entering={SlideInUp.delay(150)}
            exiting={SlideOutUp}
          >
            {t("partial-match.reconsider") as string}
          </Animated.Text>
        )}

        {!isPartial && (
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
        )}

        <Animated.View
          entering={ModalEnteringTransition}
          exiting={ModalExitingTransition}
          style={{
            marginTop: Platform.OS === "ios" ? 0 : 20,
          }}
        >
          <Card>
            {isPartial && likedBy && <LikedByAvatars likedBy={likedBy} />}

            <LinearGradient
              colors={["transparent", "transparent", theme.colors.surface]}
              style={[styles.gradient, { width: cardWidth, height: cardHeight }]}
            >
              <Text style={styles.title}>{match.title || match.name}</Text>

              <View
                style={{
                  flexDirection: "row",
                  paddingHorizontal: spacing.sm + 2,
                  marginBottom: spacing.xs + 1,
                }}
              >
                <RatingIcons size={15} vote={match?.vote_average} />
              </View>

              <View style={styles.meta}>
                {match.genres ? (
                  <GenresView genres={match.genres.slice(0, 3)} />
                ) : null}
                <Text style={styles.release_date}>
                  {match.release_date || match.first_air_date}
                </Text>
              </View>
            </LinearGradient>

            <Poster
              link={false}
              imageDimensions={{ width: cardWidth, height: cardHeight }}
              card={match}
            />
          </Card>
        </Animated.View>

        {!isPartial && (
          <Animated.View exiting={FadeOut} style={styles.share}>
            <ShareTicketButton movie={match} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}
