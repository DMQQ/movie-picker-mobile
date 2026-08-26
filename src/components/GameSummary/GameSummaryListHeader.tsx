import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Text from "../Text";
import AnimatedBg from "./AnimatedBg";
import GameSummaryHeader from "./GameSummaryHeader";
import StatsDashboard from "./StatsDashboard";
import PlayerPerformance from "./PlayerPerformance";
import RoomShareStrip from "../Room/RoomShareStrip";
import CreateCollectionFromLiked from "../CreateCollectionFromLiked";
import SignUpNudgeBanner from "../SignUpNudgeBanner";
import SegmentedControl from "../SegmentedControl";
import useTranslation from "../../service/useTranslation";
import { IGameSummary } from "./types";
import type { MovieLike, SummaryTab } from "./MovieGrid";
import { colors, fontSize, spacing, typography } from "../../constants/design";

interface GameSummaryListHeaderProps {
  summary: IGameSummary | null;
  userId: string | null;
  roomId: string;
  matches: MovieLike[];
  likes: MovieLike[];
  tab: SummaryTab;
  onTabChange: (tab: SummaryTab) => void;
}

const TAB_OPTIONS = [
  { value: "matches", labelKey: "game-summary.tab-matches" },
  { value: "likes", labelKey: "game-summary.tab-picks" },
];

const HERO_HEIGHT = 310;

export default function GameSummaryListHeader({
  summary,
  userId,
  roomId,
  matches,
  likes,
  tab,
  onTabChange,
}: GameSummaryListHeaderProps) {
  const t = useTranslation();
  const hasMatches = matches.length > 0;

  const fanPosters = useMemo(
    () =>
      (hasMatches ? matches : likes)
        .slice(0, 5)
        .map((m) => m.poster_path)
        .filter((p): p is string => Boolean(p)),
    [hasMatches, matches, likes],
  );

  const activeData = useMemo(
    () => (tab === "matches" ? matches : likes),
    [tab, matches, likes],
  );

  return (
    <View>
      <View style={[styles.hero, { height: HERO_HEIGHT }]}>
        {fanPosters.length > 0 && <AnimatedBg posters={fanPosters} />}
        <View style={styles.heroLabel}>
          <GameSummaryHeader
            gameEndReason={summary?.gameEndReason}
            maxRounds={summary?.maxRounds}
            type={summary?.type}
            roomId={summary?.roomId || roomId}
            hasMatches={hasMatches}
            matchCount={matches.length}
          />
        </View>
      </View>
      {summary && <StatsDashboard summary={summary} userId={userId} />}
      <View style={styles.combinedSection}>
        {summary?.users && <PlayerPerformance users={summary.users} />}
        <Text style={styles.shareDesc}>{t("game-summary.invite-friends-desc")}</Text>
        <RoomShareStrip qrCode={summary?.roomId || roomId} webPath="swipe" roomId={summary?.roomId || roomId} />
      </View>

      <View style={styles.tabHeader}>
        <View style={styles.tabTitleRow}>
          <Text style={styles.tabTitle}>
            {t(tab === "matches" ? "game-summary.tab-matches" : "game-summary.tab-picks")}
          </Text>
          {activeData.length > 0 && <CreateCollectionFromLiked data={activeData} />}
        </View>
        <SegmentedControl
          options={TAB_OPTIONS.map((o) => ({ ...o, label: t(o.labelKey) }))}
          value={tab}
          onChange={(v) => onTabChange(v as SummaryTab)}
        />
        <SignUpNudgeBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: -spacing.screen,
    marginBottom: spacing.lg,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroLabel: {
    paddingHorizontal: spacing.screen,
  },
  combinedSection: {
    gap: spacing.sm,
  },
  shareDesc: {
    fontSize: fontSize.md,
    color: colors.placeholder,
  },
  tabHeader: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  tabTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabTitle: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.auth,
    color: colors.text,
  },
});
