import { router, useLocalSearchParams } from "expo-router";
import Text from "../../components/Text";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Share, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
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
  const likes = useAppSelector((st) => st.room.likes);
  const [shareVisible, setShareVisible] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(false);
  const { summary, loading, error, shouldShowRatingPill, userId } =
    useGameSummary(roomId);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status, canAskAgain }) => {
      if (status !== "granted" && canAskAgain) setShowNotifBanner(true);
    });
  }, []);

  const handleEnableNotifications = useCallback(async () => {
    setShowNotifBanner(false);
    await Notifications.requestPermissionsAsync();
  }, []);

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

  const handleShareCode = useCallback(() => {
    const code = (summary?.roomId || roomId).toUpperCase();
    const webUrl = `https://flickmate.app/swipe/${code}`;
    Share.share({
      message: t("room.share.message", { code }) + "\nOr join via " + webUrl,
      url: webUrl,
    });
  }, [summary?.roomId, roomId, t]);

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
        <View style={styles.asyncBanner}>
          <View style={styles.asyncBannerText}>
            <MaterialCommunityIcons name="clock-outline" size={13} color={colors.placeholder} style={styles.asyncIcon} />
            <Text style={styles.asyncHintText}>{t("room.invite-post-finish.async-hint")}</Text>
          </View>
          <Button
            mode="outlined"
            icon="share-variant"
            compact
            onPress={handleShareCode}
            style={styles.asyncShareBtn}
            contentStyle={styles.asyncShareBtnContent}
          >
            {t("room.share.button") as string}
          </Button>
        </View>
        {showNotifBanner && (
          <View style={styles.notifBanner}>
            <MaterialCommunityIcons name="bell-outline" size={15} color={colors.primary} />
            <Text style={styles.notifBannerText}>{t("room.invite-post-finish.notif-hint")}</Text>
            <Button mode="text" compact onPress={handleEnableNotifications}>
              {t("room.invite-post-finish.notif-enable") as string}
            </Button>
          </View>
        )}
      </View>
    ),
    [summary, userId, roomId, hasMatches, t, handleShareCode, showNotifBanner, handleEnableNotifications],
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
          paddingHorizontal: spacing.screen,
          paddingTop: Platform.OS === "ios" ? insets.top + 15 : 15,
          paddingBottom: insets.bottom,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.screen,
    marginTop: spacing.xxl + 6,
  },
  sectionTitle: { fontSize: typography.bebasSize.section, fontFamily: "Bebas" },
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
  asyncBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -spacing.md,
    gap: spacing.sm,
  },
  asyncBannerText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  asyncIcon: { marginTop: 2 },
  asyncHintText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.placeholder,
    lineHeight: 18,
  },
  asyncShareBtn: {
    borderRadius: radius.pill,
    borderColor: colors.border,
  },
  asyncShareBtnContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  notifBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: `${colors.primary}18`,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.primary}40`,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    marginTop: spacing.sm,
  },
  notifBannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 18,
  },
});
