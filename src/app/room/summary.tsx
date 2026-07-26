import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
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
import { useGameSummary } from "../../hooks/useGameSummary";
import useTranslation from "../../service/useTranslation";
import { FlatList } from "react-native";

type MovieLike = { id?: number; title?: string; poster_path?: string };

type SectionItem = {
  type: "section";
  key: string;
  titleKey: string;
  saveData: MovieLike[];
};

type EmptyItem = { type: "empty"; key: string };

type RowItem = {
  type: "row";
  key: string;
  movies: MovieLike[];
  badgeFlags: boolean[];
};

type ListItem = SectionItem | EmptyItem | RowItem;

export default function GameSummary() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const likes = useAppSelector((st) => st.room.room.likes);
  const [shareVisible, setShareVisible] = useState(false);
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

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    if (hasMatches) {
      items.push({
        type: "section",
        key: "sec-matched",
        titleKey: "game-summary.matched-movies",
        saveData: matches,
      });
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

    if (likesList.length > 0) {
      items.push({
        type: "section",
        key: "sec-picks",
        titleKey: "game-summary.your-picks",
        saveData: likesList,
      });
      for (let i = 0; i < likesList.length; i += 3) {
        const row = likesList.slice(i, i + 3);
        items.push({
          type: "row",
          key: `row-picks-${i}`,
          movies: row,
          badgeFlags: row.map((m) => matches.some((mm) => mm.id === m.id)),
        });
      }
    }

    return items;
  }, [hasMatches, matches, likesList]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      switch (item.type) {
        case "section":
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t(item.titleKey)}</Text>
              <CreateCollectionFromLiked data={item.saveData} />
            </View>
          );
        case "empty":
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {t("game-summary.no-matches")}
              </Text>
              <Text style={styles.emptyDesc}>
                {t("game-summary.no-matches-desc")}
              </Text>
              <Button onPress={handleTryAgain}>
                {t("game-summary.try-again")}
              </Button>
            </View>
          );
        case "row":
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
      }
    },
    [summaryType, t, handleTryAgain],
  );

  const listHeader = useCallback(
    () => (
      <View>
        <GameSummaryHeader
          gameEndReason={summary?.gameEndReason}
          maxRounds={summary?.maxRounds}
          type={summary?.type}
          roomId={summary?.roomId || roomId}
          hasMatches={hasMatches}
        />
        {summary && <StatsDashboard summary={summary} userId={userId} />}
        {summary?.users && <PlayerPerformance users={summary.users} />}
      </View>
    ),
    [summary, userId, roomId, hasMatches],
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
      {hasMatches && <AnimatedBg matchedMovies={matches} />}
      <FlatList
        data={listData}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        keyExtractor={(item) => item.key}
        style={{
          ...styles.list,
          paddingTop: Platform.OS === "android" ? insets.top : 0,
          marginTop: Platform.OS === "ios" ? -insets.top : 0,
        }}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingTop: Platform.OS === "ios" ? insets.top + 15 : 15,
          paddingBottom: insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      />

      <GameRatingPill shouldShow={shouldShowRatingPill} roomId={roomId} />

      <View style={styles.buttonRow}>
        <PrimaryButton onPress={handleBackToHome} style={styles.backBtn}>
          {t("game-summary.back-to-home")}
        </PrimaryButton>
        {hasMatches && (
          <Button
            mode="outlined"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShareVisible(true);
            }}
            style={styles.shareBtn}
            contentStyle={styles.btnContent}
            icon="share-variant"
          >
            {t("game-summary.share-marathon")}
          </Button>
        )}
      </View>

      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        roomId={roomId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#000" },
  centered: { justifyContent: "center", alignItems: "center" },
  list: { flex: 1 },
  loadingText: {
    fontSize: 18,
    marginTop: 15,
    opacity: 0.7,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 30,
  },
  sectionTitle: { fontSize: 35, fontFamily: "Bebas" },
  movieRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  movieCell: { flex: 1 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  emptyTitle: { color: "#fff", fontSize: 45, fontFamily: "Bebas" },
  emptyDesc: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 15,
    maxWidth: 300,
  },
  buttonRow: {
    padding: 15,
    gap: 10,
    flexDirection: "row",
    backgroundColor: "#000",
  },
  backBtn: { borderRadius: 100, flex: 1 },
  btnContent: { paddingVertical: 7.5 },
  shareBtn: { borderRadius: 100, borderColor: "rgba(255,255,255,0.3)" },
});
