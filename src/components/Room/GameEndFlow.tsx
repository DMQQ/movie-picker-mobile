import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import { FancySpinner } from "../FancySpinner";
import UserInputModal, { UserInputModalAction } from "../UserInputModal";
import { useAppSelector } from "../../redux/store";

const styles = StyleSheet.create({
  spinnerContainer: {
    paddingVertical: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});

const GameEndFlow = memo(() => {
  const roomId = useAppSelector((state) => state.room.roomId);
  const isHost = useAppSelector((state) => state.room.isHost);
  const gameEnded = useAppSelector((state) => state.room.gameEnded);
  const isPlaying = useAppSelector((state) => state.room.isPlaying);
  const canContinue = useAppSelector((state) => state.room.canContinue);
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (gameEnded && isPlaying === false) {
      if (!canContinue) {
        router.replace({ pathname: "/room/summary", params: { roomId } });
        return;
      }
      if (isHost) {
        setShowDialog(true);
      } else {
        setWaiting(true);
      }
    }
  }, [gameEnded, isPlaying, isHost, canContinue, roomId]);

  const prevGameEnded = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (prevGameEnded.current === true && gameEnded === false) {
      setShowDialog(false);
      setWaiting(false);
      setLoading(false);
    }
    prevGameEnded.current = gameEnded;
  }, [gameEnded]);

  const handlePlayAgain = useCallback(async () => {
    if (!socket || !roomId) return;
    setLoading(true);
    try {
      const response = await socket.emitWithAck("play-again", roomId);
      if (!response.success) {
        alert(response.error || t("game-summary.play-again-failed"));
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [socket, roomId, t]);

  const handleEndGame = useCallback(() => {
    if (!socket || !roomId) return;
    socket.emit("end-game", roomId);
    setShowDialog(false);
    router.replace({ pathname: "/room/summary", params: { roomId } });
  }, [socket, roomId]);

  const handleViewSummary = useCallback(() => {
    setShowDialog(false);
    setWaiting(false);
    router.replace({ pathname: "/room/summary", params: { roomId } });
  }, [roomId]);

  const playAgainActions = useMemo<UserInputModalAction[]>(
    () => [
      {
        label: t("dialogs.scan-code.endGame") as string,
        mode: "text",
        textColor: "rgba(255, 100, 100, 0.9)",
        onPress: handleEndGame,
        disabled: loading,
      },
      {
        label: t("game-summary.play-again") as string,
        mode: "contained",
        onPress: handlePlayAgain,
        disabled: loading,
        loading,
      },
    ],
    [t, handleEndGame, handlePlayAgain, loading],
  );

  const waitingActions = useMemo<UserInputModalAction[]>(
    () => [
      {
        label: t("game-summary.view-summary") as string,
        mode: "outlined",
        onPress: handleViewSummary,
      },
    ],
    [t, handleViewSummary],
  );

  return (
    <>
      <UserInputModal
        visible={showDialog}
        title={t("game-summary.game-completed") as string}
        subtitle={t("room.play-again-prompt") as string}
        actions={playAgainActions}
        statusBarTranslucent
        maxHeight="50%"
      />

      <UserInputModal
        visible={waiting}
        title={t("game-summary.game-completed") as string}
        subtitle={t("room.waiting-for-host-decision") as string}
        actions={waitingActions}
        statusBarTranslucent
        maxHeight="50%"
      >
        <View style={styles.spinnerContainer}>
          <FancySpinner size={60} />
        </View>
      </UserInputModal>
    </>
  );
});

export default GameEndFlow;
