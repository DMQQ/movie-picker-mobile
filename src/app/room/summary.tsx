import { router, useLocalSearchParams } from "expo-router";
import Text from "../../components/Text";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { roomActions } from "../../redux/room/roomSlice";
import { partyActions } from "../../redux/party/partySlice";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import { FancySpinner } from "../../components/FancySpinner";
import GameSummaryError from "../../components/GameSummary/GameSummaryError";
import GameSummaryListHeader from "../../components/GameSummary/GameSummaryListHeader";
import MovieGrid from "../../components/GameSummary/MovieGrid";
import type { SummaryTab } from "../../components/GameSummary/MovieGrid";
import ShareModal from "../../components/GameSummary/ShareModal";
import TicketButton from "../../components/TicketButton";
import SummaryFooter from "../../components/SummaryFooter";
import { useGameSummary } from "../../hooks/useGameSummary";
import { usePartyGameFlow } from "../../hooks/usePartyGameFlow";
import { useNewGameSocket } from "../../hooks/useNewGameSocket";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, fontWeight, spacing } from "../../constants/design";
import { posthog } from "../../constants/posthog";

export default function GameSummary() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const likes = useAppSelector((st) => st.room.likes);
  const isHost = useAppSelector((st) => st.room.isHost);
  const partyId = useAppSelector((st) => st.party.partyId);
  const [shareVisible, setShareVisible] = useState(false);
  const [tab, setTab] = useState<SummaryTab>("matches");
  const { summary, loading, error, userId } =
    useGameSummary(roomId);
  const { newGameLoading, handleNewGame } = useNewGameSocket(
    roomId,
    partyId,
    isHost,
  );

  const handleBackToHome = useCallback(() => {
    dispatch(roomActions.reset());
    dispatch(partyActions.clearParty());
    dispatch(reset());
    router.dismissTo("/");
  }, [dispatch]);

  const handleTryAgain = useCallback(() => {
    dispatch(roomActions.reset());
    dispatch(reset());
    router.dismissAll();
    router.replace("/room/qr-code");
  }, [dispatch]);

  const configuring = usePartyGameFlow(isHost, (mode) => {
    if (mode === "swipe") {
      handleNewGame();
    } else if (mode === "voter") {
      router.navigate("/voter" as any);
    } else {
      router.navigate("/either-or/setup" as any);
    }
  });

  const summaryType = summary?.type ?? "movie";
  const matches = summary?.matchedMovies ?? [];
  const likesList = likes ?? [];
  const hasMatches = matches.length > 0;

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
      <MovieGrid
        matches={matches}
        likes={likesList}
        tab={tab}
        summaryType={summaryType}
        onTryAgain={handleTryAgain}
        header={
          <GameSummaryListHeader
            summary={summary}
            userId={userId}
            roomId={summary?.roomId || roomId}
            matches={matches}
            likes={likesList}
            tab={tab}
            onTabChange={setTab}
          />
        }
      />

      <SummaryFooter
        isHost={isHost}
        onQuit={handleBackToHome}
        configuring={configuring}
        posthogGame="swipe"
        guestPrimaryLabel={t("game-summary.back-to-home") as string}
        guestSecondary={
          hasMatches ? (
            <TicketButton
              label={t("game-summary.share-marathon") as string}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                posthog?.capture("game_summary_share_ticket_tapped", { roomId });
                setShareVisible(true);
              }}
            />
          ) : undefined
        }
        id={roomId}
        newGameLoading={newGameLoading}
      />

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
  loadingText: {
    fontSize: fontSize.xl,
    marginTop: spacing.screen,
    opacity: 0.7,
    fontWeight: fontWeight.bold,
  },
});
