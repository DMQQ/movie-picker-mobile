import { useEffect, useRef, useState } from "react";
import { BackHandler, LayoutChangeEvent, Platform, ScrollView, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import Text from "../../components/Text";
import PrimaryButton from "../../components/PrimaryButton";
import AnimatedBg from "../../components/GameSummary/AnimatedBg";
import Podium from "../../components/EitherOr/Podium";
import Bracket, { computeBracketFitScale } from "../../components/EitherOr/Bracket";
import { FancySpinner } from "../../components/FancySpinner";
import CreateCollectionFromLiked from "../../components/CreateCollectionFromLiked";
import { useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import ReviewManager from "../../utils/rate";
import { colors, fontSize, radius, spacing, typography } from "../../constants/design";

export default function EitherOrResults() {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const top3 = useAppSelector((state) => state.eitherOr.top3);
  const champion = useAppSelector((state) => state.eitherOr.champion);
  const bracketSize = useAppSelector((state) => state.eitherOr.bracketSize);
  const matchResults = useAppSelector((state) => state.eitherOr.matchResults);

  const confettiRef = useRef<LottieView>(null);
  const [bracketCardWidth, setBracketCardWidth] = useState(0);
  const onBracketLayout = (e: LayoutChangeEvent) => setBracketCardWidth(e.nativeEvent.layout.width);
  const totalRounds = Math.log2(bracketSize);
  // Fit all rounds to card width; pass Infinity for height so only width constrains the scale.
  const bracketScale = bracketCardWidth > 0 ? computeBracketFitScale(bracketSize, totalRounds, bracketCardWidth, Infinity) : 1;

  useEffect(() => {
    if (top3.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      confettiRef.current?.play();
    }
  }, [top3.length]);

  const onDone = () => {
    ReviewManager.onGameComplete(true);
    router.dismissTo("/");
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onDone();
      return true;
    });
    return () => sub.remove();
  }, []);

  if (!top3.length) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.screen, backgroundColor: colors.appBackground }}>
        <FancySpinner />
        <Text>{t("eitherOr.results.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <AnimatedBg matchedMovies={top3} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl * 3 }}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.eyebrow}>{t("eitherOr.results.title")}</Text>
          <Text style={styles.headline}>{champion?.title || champion?.name}</Text>
        </Animated.View>

        <Podium top3={top3} />

        <View style={styles.bracketSection}>
          <Text style={styles.sectionTitle}>{t("eitherOr.bracket.title")}</Text>
          <View style={styles.bracketCard} onLayout={onBracketLayout}>
            <Bracket bracketSize={bracketSize} matchResults={matchResults} currentMatch={null} champion={champion} scale={bracketScale} />
          </View>
        </View>
      </ScrollView>

      <LottieView
        ref={confettiRef}
        source={require("../../assets/confetti.json")}
        autoPlay={false}
        loop={false}
        style={styles.confetti}
        pointerEvents="none"
      />

      <View
        style={[
          styles.buttonRow,
          { paddingBottom: Platform.OS === "android" ? spacing.screen : spacing.sm },
        ]}
      >
        <PrimaryButton onPress={onDone} style={styles.doneBtn}>
          {t("eitherOr.results.done")}
        </PrimaryButton>
        <CreateCollectionFromLiked data={top3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.empty,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  bracketSection: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.bebasSize.section,
    fontFamily: "Bebas",
    color: colors.text,
    marginBottom: spacing.md,
  },
  bracketCard: {
    borderRadius: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  buttonRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    backgroundColor: colors.appBackground,
  },
  doneBtn: {
    flex: 1,
    borderRadius: radius.pill,
  },
  confetti: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    pointerEvents: "none",
  },
});
