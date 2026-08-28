import { useContext, useEffect, useRef, useState } from "react";
import { BackHandler, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Dialog from "../../components/Dialog";
import Portal from "../../components/Portal";
import Text from "../../components/Text";
import Button from "../../components/Button";
import { FancySpinner } from "../../components/FancySpinner";
import Lobby from "../../components/EitherOr/Lobby";
import Matchup from "../../components/EitherOr/Matchup";
import RoundTransition from "../../components/EitherOr/RoundTransition";
import useEitherOrContext from "../../context/EitherOrContext";
import { SocketContext } from "../../context/SocketContext";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { eitherOrActions } from "../../redux/eitherOr/eitherOrSlice";
import useTranslation from "../../service/useTranslation";
import { colors, radius, spacing } from "../../constants/design";

const RESULTS_DELAY_MS = 1400;

export default function EitherOrRoomScreen() {
  const params = useLocalSearchParams<{ roomId: string }>();
  const { joinRoom } = useEitherOrContext();
  const { socket, connectionStatus } = useContext(SocketContext);
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const roomId = useAppSelector((state) => state.eitherOr.roomId);
  const isStarted = useAppSelector((state) => state.eitherOr.isStarted);
  const isJoining = useAppSelector((state) => state.eitherOr.isJoining);
  const joinError = useAppSelector((state) => state.eitherOr.joinError);
  const gameEnded = useAppSelector((state) => state.eitherOr.gameEnded);
  const currentMatch = useAppSelector((state) => state.eitherOr.currentMatch);
  const lastResult = useAppSelector((state) => state.eitherOr.lastResult);
  const bracketSize = useAppSelector((state) => state.eitherOr.bracketSize);
  const matchResults = useAppSelector((state) => state.eitherOr.matchResults);

  const attempted = useRef(false);
  const pendingRoundRef = useRef<number | null>(null);
  const [transitionRound, setTransitionRound] = useState<{ completed: number; next: number } | null>(null);

  useEffect(() => {
    const target = (params.roomId || "").toUpperCase();
    if (!target || target === roomId || attempted.current || !socket?.connected) return;
    attempted.current = true;
    joinRoom(target);
  }, [params.roomId, roomId, socket?.connected, joinRoom]);

  useEffect(() => {
    if (connectionStatus === "disconnected" && !roomId && !attempted.current) {
      dispatch(eitherOrActions.setJoinError(true));
    }
  }, [connectionStatus, roomId]);

  useEffect(() => {
    if (!gameEnded) return;
    const timer = setTimeout(() => router.replace("/either-or/results"), RESULTS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [gameEnded]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!gameEnded) return false;
      router.dismissTo("/");
      return true;
    });
    return () => sub.remove();
  }, [gameEnded]);

  // A round boundary (its last match just resolved) is known the instant that match's
  // result arrives — show the bracket immediately instead of waiting on a fixed timer,
  // which would otherwise let the next match's countdown silently drain while hidden.
  useEffect(() => {
    if (!lastResult || lastResult.isFinal) return;
    if (lastResult.matchIndex + 1 !== lastResult.matchesInRound) return;

    pendingRoundRef.current = lastResult.roundNumber + 1;
    setTransitionRound({ completed: lastResult.roundNumber, next: lastResult.roundNumber + 1 });
  }, [lastResult]);

  useEffect(() => {
    if (!currentMatch || pendingRoundRef.current === null) return;
    if (currentMatch.roundNumber === pendingRoundRef.current) {
      pendingRoundRef.current = null;
      setTransitionRound(null);
    }
  }, [currentMatch]);

  const onGoBack = () => {
    dispatch(eitherOrActions.reset());
    router.dismissTo("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      {!roomId ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.screen }}>
          <FancySpinner />
          <Text>{isJoining ? t("eitherOr.lobby.joining") : t("eitherOr.lobby.loading")}</Text>
        </View>
      ) : !isStarted && !gameEnded ? (
        <Lobby onGoBack={onGoBack} />
      ) : currentMatch ? (
        transitionRound ? (
          <RoundTransition
            completedRound={transitionRound.completed}
            nextRound={transitionRound.next}
            bracketSize={bracketSize}
            matchResults={matchResults}
          />
        ) : (
          <Matchup />
        )
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <FancySpinner />
        </View>
      )}

      <Portal>
        <Dialog
          dismissable={false}
          visible={joinError}
          style={{ backgroundColor: colors.surface, borderRadius: radius.sm + 2 }}
        >
          <Dialog.Title>{t("dialogs.qr.error")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("dialogs.qr.error-desc")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => router.back()}>{t("dialogs.qr.close")}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
