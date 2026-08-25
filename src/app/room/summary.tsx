import { router, useLocalSearchParams } from "expo-router";
import Text from "../../components/Text";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Button from "../../components/Button";
import PrimaryButton from "../../components/PrimaryButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { roomActions } from "../../redux/room/roomSlice";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import { FancySpinner } from "../../components/FancySpinner";
import GameRatingPill from "../../components/GameRatingPill";
import AnimatedBg from "../../components/GameSummary/AnimatedBg";
import GameSummaryHeader from "../../components/GameSummary/GameSummaryHeader";
import GameSummaryError from "../../components/GameSummary/GameSummaryError";
import StatsDashboard from "../../components/GameSummary/StatsDashboard";
import PlayerPerformance from "../../components/GameSummary/PlayerPerformance";
import MatchedItem from "../../components/GameSummary/MatchedItem";
import CreateCollectionFromLiked from "../../components/CreateCollectionFromLiked";
import ShareModal from "../../components/GameSummary/ShareModal";
import SegmentedControl from "../../components/SegmentedControl";
import SignUpNudgeBanner from "../../components/SignUpNudgeBanner";
import { useGameSummary } from "../../hooks/useGameSummary";
import useTranslation from "../../service/useTranslation";
import { FlatList } from "react-native";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
  typography,
} from "../../constants/design";
import { posthog } from "../../constants/posthog";
import TicketButton from "../../components/TicketButton";
import RoomShareStrip from "../../components/Room/RoomShareStrip";

type MovieLike = { id?: number; title?: string; poster_path?: string };

type EmptyItem = { type: "empty"; key: string };

type RowItem = {
  type: "row";
  key: string;
  movies: MovieLike[];
  badgeFlags: boolean[];
};

type ListItem = EmptyItem | RowItem;

type Tab = "matches" | "likes";

const TAB_OPTIONS = [
  { value: "matches", label: "Matched" },
  { value: "likes", label: "Your Picks" },
];

export default function GameSummary() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const likes = useAppSelector((st) => st.room.likes);
  const [shareVisible, setShareVisible] = useState(false);
  const [tab, setTab] = useState<Tab>("matches");
  const { summary, loading, error, shouldShowRatingPill, userId } =
    useGameSummary(roomId);

  const handleBackToHome = useCallback(() => {
    dispatch(roomActions.reset());
    dispatch(reset());
    router.dismissTo("/");
  }, [dispatch]);

  const handleTryAgain = useCallback(() => {
    dispatch(roomActions.reset());
    dispatch(reset());
    router.dismissAll();
    router.replace("/room/qr-code");
  }, [dispatch]);

  const summaryType = summary?.type ?? "movie";
  const matches = summary?.matchedMovies ?? [];
  const likesList = likes ?? [];
  const hasMatches = matches.length > 0;

  const fanPosters = useMemo(
    () =>
      (hasMatches ? matches : likesList)
        .slice(0, 5)
        .map((m) => m.poster_path)
        .filter((p): p is string => Boolean(p)),
    [hasMatches, matches, likesList],
  );

  const noMatchContent = useMemo(() => {
    const titles = t("game-summary.no-matches-titles") as unknown as string[];
    const descs = t("game-summary.no-matches-descs") as unknown as string[];
    const idx = Math.floor(Math.random() * titles.length);
    return { title: titles[idx], desc: descs[idx] };
  }, [t]);

  const activeData = useMemo(
    () => (tab === "matches" ? matches : likesList),
    [tab, matches, likesList],
  );

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    if (tab === "matches") {
      if (hasMatches) {
        for (let i = 0; i < matches.length; i += 3) {
          items.push({
            type: "row",
            key: `row-matched-${i}`,
            movies: matches.slice(i, i + 3),
            badgeFlags: [],
          });
        }
      } else {
        items.push({ type: "empty", key: "empty-matches" });
      }
    } else {
      if (likesList.length > 0) {
        for (let i = 0; i < likesList.length; i += 3) {
          const row = likesList.slice(i, i + 3);
          items.push({
            type: "row",
            key: `row-picks-${i}`,
            movies: row,
            badgeFlags: row.map((m) => matches.some((mm) => mm.id === m.id)),
          });
        }
      } else {
        items.push({ type: "empty", key: "empty-likes" });
      }
    }

    return items;
  }, [tab, hasMatches, matches, likesList]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "empty") {
        if (tab === "matches") {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{noMatchContent.title}</Text>
              <Text style={styles.emptyDesc}>{noMatchContent.desc}</Text>
              <Button onPress={handleTryAgain}>
                {t("game-summary.try-again")}
              </Button>
            </View>
          );
        }
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyDesc}>No picks yet</Text>
          </View>
        );
      }

      return (
        <View style={styles.movieRow}>
          {item.movies.map((movie, idx) => (
            <View key={movie.id ?? idx} style={styles.movieCell}>
              <MatchedItem
                {...movie}
                summary={{ type: summaryType }}
                badge={item.badgeFlags[idx] ?? false}
              />
            </View>
          ))}
          {Array.from({ length: 3 - item.movies.length }).map((_, i) => (
            <View key={`ph-${i}`} style={styles.movieCell} />
          ))}
        </View>
      );
    },
    [summaryType, t, handleTryAgain, noMatchContent, tab],
  );

  const heroHeight = 310;

  const listHeader = useCallback(
    () => (
      <View>
        <View style={[styles.hero, { height: heroHeight }]}>
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
              {tab === "matches" ? "Matched" : "Your Picks"}
            </Text>
            {activeData.length > 0 && <CreateCollectionFromLiked data={activeData} />}
          </View>
          <SegmentedControl
            options={TAB_OPTIONS}
            value={tab}
            onChange={(v) => setTab(v as Tab)}
          />
          <SignUpNudgeBanner />

        </View>
      </View>
    ),
    [summary, userId, roomId, hasMatches, matches.length, fanPosters, t, tab, activeData, heroHeight],
  );

  if (loading) {
    return (
      <View style={[styles.fill, styles.centered]}>
        <FancySpinner size={80} />
        <Text style={styles.loadingText}>{t("game-summary.loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.fill, styles.centered]}>
        <GameSummaryError error={error} onBack={handleBackToHome} />
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        keyExtractor={(item) => item.key}
        style={styles.list}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: 90,
        }}
        showsVerticalScrollIndicator={false}
      />

      <GameRatingPill shouldShow={shouldShowRatingPill} roomId={roomId} />

      <View
        style={[
          styles.buttonRow,
          {
            paddingBottom: Platform.OS === "android" ? spacing.screen : 0,
          },
        ]}
      >
        <PrimaryButton onPress={handleBackToHome} style={styles.backBtn}>
          {t("game-summary.back-to-home")}
        </PrimaryButton>
        {hasMatches && (
          <TicketButton
            label={t("game-summary.share-marathon") as string}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              posthog?.capture("game_summary_share_ticket_tapped", { roomId });
              setShareVisible(true);
            }}
          />
        )}
      </View>

      {shareVisible && (
        <ShareModal
          visible={shareVisible}
          onClose={() => setShareVisible(false)}
          roomId={roomId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.appBackground },
  centered: { justifyContent: "center", alignItems: "center" },
  list: { flex: 1 },
  loadingText: {
    fontSize: fontSize.xl,
    marginTop: spacing.screen,
    opacity: 0.7,
    fontWeight: fontWeight.bold,
  },
  movieRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginBottom: spacing.screen,
  },
  movieCell: { flex: 1 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xxl + 6,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.bebasSize.empty,
    fontFamily: "Bebas",
  },
  emptyDesc: {
    color: colors.text,
    fontSize: fontSize.lg,
    textAlign: "center",
    marginVertical: spacing.screen,
    maxWidth: 300,
  },
  buttonRow: {
    padding: spacing.screen,
    paddingBottom: 0,
    gap: spacing.sm + 2,
    flexDirection: "row",
    backgroundColor: colors.appBackground,
  },
  backBtn: { borderRadius: radius.pill, flex: 1 },
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
  shareHeader: {
    gap: spacing.xs,
  },
  shareTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: colors.text,
    letterSpacing: 1,
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
