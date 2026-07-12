import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTutorialSeen } from "../hooks/useTutorial";
import PlatformBlurView from "./PlatformBlurView";

const PAGES = [
  {
    title: "How to vote",
    rows: [
      {
        icon: "heart" as const,
        color: "#42DCA3",
        label: "Like",
        desc: "Swipe right or tap ❤ — you want to watch this",
      },
      {
        icon: "close" as const,
        color: "#FF4458",
        label: "Pass",
        desc: "Swipe left or tap ✕ — not feeling it",
      },
      {
        icon: "information-outline" as const,
        color: "rgba(255,255,255,0.4)",
        label: "Details",
        desc: "Tap the card to see cast, trailer and info",
      },
    ],
  },
  {
    title: "Special actions",
    rows: [
      {
        icon: "star" as const,
        color: "#FFD700",
        label: "Super Like",
        desc: "Strong yes — also saves to your must-watch list",
      },
      {
        icon: "cancel" as const,
        color: "#8B0000",
        label: "Block",
        desc: "Never show this title again across all games",
      },
    ],
  },
  {
    title: "Getting a match",
    rows: [
      {
        icon: "fire" as const,
        color: "#FF6B35",
        label: "Match!",
        desc: "When everyone in the room likes the same film — it's a match",
      },
      {
        icon: "bookmark-multiple" as const,
        color: "#BB86FC",
        label: "Saved",
        desc: "All your matches are saved to the game history",
      },
    ],
  },
  {
    title: "Track your session",
    rows: [
      {
        icon: "cards" as const,
        color: "#BB86FC",
        label: "Liked movies",
        desc: "Tap the stacked posters in the top-right to browse all your likes and matches so far",
      },
      {
        icon: "chart-donut" as const,
        color: "#42DCA3",
        label: "Progress ring",
        desc: "The circle around the posters shows how far through the movie deck you've swiped",
      },
    ],
  },
];

export default function SwipeHintOverlay() {
  const { seen, markSeen } = useTutorialSeen("tutorial_swipe_seen");
  const [page, setPage] = useState(0);
  const isLast = page === PAGES.length - 1;

  const handleNext = () => {
    if (isLast) {
      markSeen();
    } else {
      setPage(p => p + 1);
    }
  };

  if (seen === null || seen) return null;

  const current = PAGES[page];

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
            <Text style={styles.title}>{current.title}</Text>

            <View style={styles.rows}>
              {current.rows.map(row => (
                <View key={row.label} style={styles.row}>
                  <View style={[styles.iconWrap, { borderColor: row.color + "55" }]}>
                    <MaterialCommunityIcons name={row.icon} size={22} color={row.color} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowLabel, { color: row.color }]}>{row.label}</Text>
                    <Text style={styles.rowDesc}>{row.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <View style={styles.dots}>
                {PAGES.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === page ? styles.dotActive : styles.dotInactive]}
                  />
                ))}
              </View>
              <Button
                mode="contained"
                onPress={handleNext}
                style={styles.nextButton}
                contentStyle={styles.nextButtonContent}
                labelStyle={styles.nextButtonLabel}
              >
                {isLast ? "Got it" : "Next"}
              </Button>
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
    borderRadius: 24,
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
    padding: 24,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 28,
    color: "#fff",
    letterSpacing: 0.8,
    marginBottom: 20,
  },
  rows: {
    gap: 16,
    marginBottom: 28,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 13,
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
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
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
    borderRadius: 100,
  },
  nextButtonContent: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  nextButtonLabel: {
    fontSize: 14,
  },
});
