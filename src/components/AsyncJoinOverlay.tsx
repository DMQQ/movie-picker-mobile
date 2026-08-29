import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import Text from "./Text";
import AnimatedHeading from "./AnimatedHeading";
import PrimaryButton from "./PrimaryButton";
import { colors, fontSize, radius, spacing, withAlpha } from "../constants/design";
import useTranslation from "../service/useTranslation";

const DISMISS_DELAY = 5000;

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillValue}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

export default function AsyncJoinOverlay() {
  const dispatch = useAppDispatch();
  const info = useAppSelector((state) => state.room.asyncJoinInfo);
  const t = useTranslation();

  useEffect(() => {
    if (!info) return;
    const id = setTimeout(() => dispatch(roomActions.setAsyncJoinInfo(null)), DISMISS_DELAY);
    return () => clearTimeout(id);
  }, [info, dispatch]);

  if (!info) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(250)} style={styles.overlay}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="progress-clock" size={40} color={colors.primary} />
        <View style={styles.textBlock}>
          <AnimatedHeading line1={t("async-join.title")} charDelay={20} centered />
          <Text style={styles.subtitle}>{t("async-join.subtitle")}</Text>
        </View>
        <View style={styles.stats}>
          <StatPill label={t("async-join.liked")} value={info.likedMovies} />
          <StatPill label={t("async-join.matches")} value={info.matches} />
          <StatPill label={t("async-join.players")} value={info.players} />
        </View>
        <PrimaryButton style={styles.dismiss} onPress={() => dispatch(roomActions.setAsyncJoinInfo(null))}>
          {t("async-join.got-it")}
        </PrimaryButton>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.appBackground,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    zIndex: 100,
  },
  content: {
    width: "100%",
    alignItems: "center",
    gap: spacing.xl,
  },
  textBlock: {
    alignItems: "center",
    gap: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.placeholder,
    textAlign: "center",
  },
  stats: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    backgroundColor: withAlpha(colors.primary, 0.12),
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: 2,
  },
  pillValue: {
    fontFamily: "Bebas",
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: 1,
    color: colors.primary,
  },
  pillLabel: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
  },
  dismiss: {
    width: "100%",
  },
});
