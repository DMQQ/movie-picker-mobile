import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontWeight, fontSize, radius, spacing } from "../constants/design";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import PrimaryButton from "./PrimaryButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTutorialSeen } from "../hooks/useTutorial";
import PlatformBlurView from "./PlatformBlurView";
import useTranslation from "../service/useTranslation";

const PAGE_KEYS = [
  "how_to_vote",
  "special_actions",
  "getting_a_match",
  "track_session",
] as const;

type PageKey = (typeof PAGE_KEYS)[number];

const PAGE_ROWS: Record<PageKey, { icon: string; color: string; labelKey: string; descKey: string }[]> = {
  how_to_vote: [
    { icon: "heart", color: "#42DCA3", labelKey: "swipe_tutorial.how_to_vote.like_label", descKey: "swipe_tutorial.how_to_vote.like_desc" },
    { icon: "close", color: "#FF4458", labelKey: "swipe_tutorial.how_to_vote.pass_label", descKey: "swipe_tutorial.how_to_vote.pass_desc" },
    { icon: "information-outline", color: "rgba(255,255,255,0.4)", labelKey: "swipe_tutorial.how_to_vote.details_label", descKey: "swipe_tutorial.how_to_vote.details_desc" },
  ],
  special_actions: [
    { icon: "star", color: "#FFD700", labelKey: "swipe_tutorial.special_actions.super_like_label", descKey: "swipe_tutorial.special_actions.super_like_desc" },
    { icon: "cancel", color: "#8B0000", labelKey: "swipe_tutorial.special_actions.block_label", descKey: "swipe_tutorial.special_actions.block_desc" },
  ],
  getting_a_match: [
    { icon: "fire", color: "#FF6B35", labelKey: "swipe_tutorial.getting_a_match.match_label", descKey: "swipe_tutorial.getting_a_match.match_desc" },
    { icon: "bookmark-multiple", color: "#BB86FC", labelKey: "swipe_tutorial.getting_a_match.saved_label", descKey: "swipe_tutorial.getting_a_match.saved_desc" },
  ],
  track_session: [
    { icon: "cards", color: "#BB86FC", labelKey: "swipe_tutorial.track_session.liked_label", descKey: "swipe_tutorial.track_session.liked_desc" },
    { icon: "chart-donut", color: "#42DCA3", labelKey: "swipe_tutorial.track_session.progress_label", descKey: "swipe_tutorial.track_session.progress_desc" },
  ],
};

const PAGE_TITLE_KEYS: Record<PageKey, string> = {
  how_to_vote: "swipe_tutorial.how_to_vote.title",
  special_actions: "swipe_tutorial.special_actions.title",
  getting_a_match: "swipe_tutorial.getting_a_match.title",
  track_session: "swipe_tutorial.track_session.title",
};

export default function SwipeHintOverlay() {
  const { seen, markSeen } = useTutorialSeen("tutorial_swipe_seen");
  const [page, setPage] = useState(0);
  const isLast = page === PAGE_KEYS.length - 1;
  const t = useTranslation();

  const handleNext = () => {
    if (isLast) {
      markSeen();
    } else {
      setPage(p => p + 1);
    }
  };

  if (seen === null || seen) return null;

  const currentKey = PAGE_KEYS[page];
  const currentRows = PAGE_ROWS[currentKey];
  const currentTitle = t(PAGE_TITLE_KEYS[currentKey]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlay]}
      entering={FadeIn.delay(600).duration(350)}
      exiting={FadeOut.duration(250)}
    >
      {/* Full-screen backdrop tap — rendered first so card sits on top */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleNext} />

      <PlatformBlurView
        style={[styles.card, Platform.OS === "android" && styles.androidBg]}
        intensity={90}
      >
        <View style={styles.darkOverlay}>
          <View style={styles.cardInner}>
            <Text style={styles.title}>{currentTitle}</Text>

            <View style={styles.rows}>
              {currentRows.map(row => (
                <View key={row.labelKey} style={styles.row}>
                  <View style={[styles.iconWrap, { borderColor: row.color + "55" }]}>
                    <MaterialCommunityIcons name={row.icon as any} size={22} color={row.color} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowLabel, { color: row.color }]}>{t(row.labelKey)}</Text>
                    <Text style={styles.rowDesc}>{t(row.descKey)}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <View style={styles.dots}>
                {PAGE_KEYS.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === page ? styles.dotActive : styles.dotInactive]}
                  />
                ))}
              </View>
              <PrimaryButton onPress={handleNext} style={styles.nextButton}>
                {isLast ? t("swipe_tutorial.got_it") : t("swipe_tutorial.next")}
              </PrimaryButton>
            </View>
          </View>
        </View>
      </PlatformBlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.78)",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "82%",
    borderRadius: radius.lg,
    overflow: "hidden",
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      },
    }),
  },
  androidBg: {
    backgroundColor: "#181818",
  },
  darkOverlay: {
    backgroundColor: "rgba(10,10,10,0.82)",
  },
  cardInner: {
    padding: spacing.xxl,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 28,
    color: "#fff",
    letterSpacing: 0.8,
    marginBottom: spacing.xl,
  },
  rows: {
    gap: spacing.lg,
    marginBottom: spacing.xxl + 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: fontSize.md - 1,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs - 2,
  },
  rowDesc: {
    fontSize: fontSize.md - 1,
    color: "rgba(255,255,255,0.58)",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: {
    flexDirection: "row",
    gap: spacing.sm - 2,
  },
  dot: {
    height: 6,
    borderRadius: radius.xs - 1,
  },
  dotActive: {
    width: 20,
    backgroundColor: "#fff",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  nextButton: {
    borderRadius: radius.pill,
  },
  nextButtonContent: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 2,
  },
  nextButtonLabel: {
    fontSize: fontSize.md,
  },
});
