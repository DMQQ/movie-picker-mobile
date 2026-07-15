import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
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
import MatchedMoviesSection from "../../components/GameSummary/MatchedMoviesSection";
import YourPicksList from "../../components/GameSummary/YourPicksList";
import ShareModal from "../../components/GameSummary/ShareModal";
import { useGameSummary } from "../../hooks/useGameSummary";
import useTranslation from "../../service/useTranslation";

export default function GameSummary() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const likes = useAppSelector((st) => st.room.room.likes);
  const [shareVisible, setShareVisible] = useState(false);
  const { summary, loading, error, shouldShowRatingPill, userId } =
    useGameSummary(roomId);

  const handleBackToHome = () => {
    dispatch(roomActions.reset());
    dispatch(reset());
    router.dismissTo("/");
  };

  const handleTryAgain = () => {
    dispatch(roomActions.reset());
    dispatch(reset());
    router.dismissAll();
    router.replace("/room/qr-code");
  };

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
      {(summary?.matchedMovies?.length || 0) > 0 && (
        <AnimatedBg matchedMovies={summary!.matchedMovies} />
      )}
      <ScrollView
        style={[
          styles.scroll,
          {
            paddingTop: Platform.OS === "android" ? insets.top : 0,
            marginTop: Platform.OS === "ios" ? -insets.top : 0,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
        }}
      >
        <View style={styles.content}>
          <GameSummaryHeader
            gameEndReason={summary?.gameEndReason}
            maxRounds={summary?.maxRounds}
            type={summary?.type}
            roomId={summary?.roomId || roomId}
            hasMatches={(summary?.matchedMovies?.length || 0) > 0}
          />
          {summary && <StatsDashboard summary={summary} userId={userId} />}
          {summary?.users && <PlayerPerformance users={summary.users} />}
          {summary && (
            <MatchedMoviesSection
              summary={summary}
              onTryAgain={handleTryAgain}
            />
          )}
          {summary && (likes?.length || 0) > 0 && (
            <YourPicksList likes={likes!} summary={summary} />
          )}
        </View>
      </ScrollView>

      <GameRatingPill shouldShow={shouldShowRatingPill} roomId={roomId} />

      <View style={styles.buttonRow}>
        <PrimaryButton onPress={handleBackToHome} style={styles.backBtn}>
          {t("game-summary.back-to-home")}
        </PrimaryButton>
        {(summary?.matchedMovies?.length || 0) > 0 && (
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
  scroll: { flex: 1, paddingHorizontal: 15 },
  content: { paddingTop: 15, paddingBottom: 20 },
  loadingText: {
    fontSize: 18,
    marginTop: 15,
    opacity: 0.7,
    fontWeight: "bold",
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
