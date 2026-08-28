import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Text from "../Text";
import Touch from "../Touch";
import Thumbnail, { ThumbnailSizes } from "../Thumbnail";
import type { Movie } from "../../../types";
import type { Side } from "../../redux/eitherOr/eitherOrSlice";
import { colors, fontSize, radius, spacing, withAlpha } from "../../constants/design";

interface Props {
  movie: Movie;
  side: Side;
  votes: number;
  totalVotes: number;
  votedSide: Side | null;
  outcome: "won" | "lost" | null;
  onPress: (side: Side) => void;
  width?: number;
  height?: number;
}

export default function MatchupCard({ movie, side, votes, totalVotes, votedSide, outcome, onPress, width, height }: Props) {
  const scale = useSharedValue(1);
  const dim = useSharedValue(0);
  const barWidth = useSharedValue(0);
  const votedRowOpacity = useSharedValue(0);

  useEffect(() => {
    const exitCfg = { duration: 220, easing: Easing.out(Easing.cubic) };
    if (outcome === "won") {
      scale.value = withTiming(1.04, exitCfg);
      dim.value = withTiming(0, { duration: 200 });
    } else if (outcome === "lost") {
      scale.value = withTiming(0.94, exitCfg);
      dim.value = withTiming(votedSide === side ? 0.2 : 0.55, exitCfg);
    } else {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
      dim.value = withTiming(0, { duration: 150 });
    }
  }, [outcome, votedSide, side]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dimStyle = useAnimatedStyle(() => ({
    opacity: dim.value,
  }));

  const hasVoted = votedSide !== null;
  const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  const isMySide = votedSide === side;

  useEffect(() => {
    barWidth.value = withTiming(hasVoted ? percent : 0, { duration: 350, easing: Easing.out(Easing.cubic) });
  }, [hasVoted, percent]);

  useEffect(() => {
    votedRowOpacity.value = withTiming(isMySide ? 1 : 0, { duration: 200 });
  }, [isMySide]);

  const barFillStyle = useAnimatedStyle(() => ({ width: `${barWidth.value}%` }));
  const votedRowStyle = useAnimatedStyle(() => ({ opacity: votedRowOpacity.value }));

  const isPicked = isMySide;
  const showPickedBadge = isMySide && !outcome;

  return (
    <Animated.View
      style={[
        styles.container,
        width != null && { width, height, aspectRatio: undefined },
        isPicked && styles.containerPicked,
        animatedStyle,
      ]}
    >
      <Touch
        disabled={!!outcome || hasVoted}
        scaleTo={0.96}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress(side);
        }}
        style={{ flex: 1 }}
      >
        <Thumbnail
          path={movie.poster_path}
          size={ThumbnailSizes.poster.xlarge}
          container={{ flex: 1, borderRadius: radius.card }}
          style={{ borderRadius: radius.card }}
        />

        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.dimOverlay, dimStyle]}
        />

        {showPickedBadge && (
          <Animated.View style={[styles.badge, styles.badgePicked, votedRowStyle]}>
            <MaterialCommunityIcons name="check-bold" size={16} color={colors.text} />
          </Animated.View>
        )}
        {outcome === "won" && (
          <View style={styles.badge}>
            <MaterialCommunityIcons name="trophy" size={16} color={colors.appBackground} />
          </View>
        )}
        {outcome === "lost" && (
          <View style={[styles.badge, styles.badgeLost]}>
            <MaterialCommunityIcons name="close" size={16} color={colors.text} />
          </View>
        )}

        <LinearGradient colors={["transparent", "rgba(0,0,0,0.92)"]} style={styles.gradient}>
          <View style={styles.voteInfo}>
            <Animated.View style={[styles.votedRow, votedRowStyle]}>
              <MaterialCommunityIcons name="check-circle" size={14} color={colors.primary} />
              <Text style={styles.votedText}>{votes}</Text>
            </Animated.View>

            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFill, barFillStyle]} />
            </View>
          </View>
        </LinearGradient>
      </Touch>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: radius.card,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
  },
  containerPicked: {
    borderColor: colors.primary,
  },
  dimOverlay: {
    backgroundColor: "#000",
    borderRadius: radius.card,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.sm + 2,
    paddingTop: spacing.xl,
  },
  voteInfo: {
    minHeight: 24,
  },
  votedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  votedText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  barTrack: {
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: withAlpha(colors.text, 0.15),
    marginTop: spacing.xs + 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
  },
  badge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: "#FFD166",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLost: {
    backgroundColor: withAlpha(colors.text, 0.25),
  },
  badgePicked: {
    backgroundColor: colors.primary,
  },
});
