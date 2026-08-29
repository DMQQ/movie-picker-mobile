import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Modal, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "../QRCode";
import { SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import { FancySpinner } from "../FancySpinner";
import UserInputModal, { UserInputModalAction } from "../UserInputModal";
import Button from "../Button";
import PrimaryButton from "../PrimaryButton";
import PlatformBlurView from "../PlatformBlurView";
import Text from "../Text";
import RoomShareStrip from "./RoomShareStrip";
import { useAppSelector } from "../../redux/store";
import { colors, fontSize, radius, spacing } from "../../constants/design";
import { posthog } from "../../constants/posthog";

const CARD_WIDTH = Dimensions.get("window").width - 40;

const GameEndFlow = memo(() => {
  const roomId = useAppSelector((state) => state.room.roomId);
  const qrCode = useAppSelector((state) => state.room.qrCode);
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
    posthog?.capture("play_again_tapped", { game: "swipe", restart: true });
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

  const code = qrCode?.toUpperCase() ?? "";

  return (
    <>
      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={undefined}
      >
        <View style={styles.overlay}>
          <PlatformBlurView style={[styles.card, { width: CARD_WIDTH }]}>

            {/* Header */}
            <Text style={styles.title}>{t("game-summary.game-completed") as string}</Text>
            <Text style={styles.subtitle}>{t("room.play-again-prompt") as string}</Text>

            {/* Invite section */}
            {code ? (
              <View style={styles.inviteSection}>
                {/* QR + code side by side */}
                <View style={styles.qrSide}>
                  <QRCode
                    value={`flickmate://room/${code}`}
                    size={100}
                    color={colors.primary}
                    backgroundColor={colors.text}
                  />
                </View>
                <View style={styles.codeSide}>
                  <Text style={styles.codeLabel}>{t("room.invite-post-finish.code-label") as string}</Text>
                  <Text style={styles.codeValue}>{code}</Text>
                  <RoomShareStrip qrCode={code} webPath="swipe" roomId={roomId ?? undefined} />
                </View>
              </View>
            ) : null}

            {/* Async hint */}
            {code ? (
              <View style={styles.asyncHint}>
                <MaterialCommunityIcons name="clock-outline" size={15} color={colors.placeholder} />
                <Text style={styles.asyncText}>{t("room.invite-post-finish.async-hint") as string}</Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleEndGame}
                disabled={loading}
                style={styles.actionBtn}
                contentStyle={styles.actionBtnContent}
                textColor="rgba(255,100,100,0.9)"
              >
                {t("dialogs.scan-code.endGame") as string}
              </Button>
              <PrimaryButton
                onPress={handlePlayAgain}
                disabled={loading}
                loading={loading}
                style={[styles.actionBtn, styles.playAgainBtn]}
              >
                {t("game-summary.play-again") as string}
              </PrimaryButton>
            </View>

          </PlatformBlurView>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  card: {
    borderRadius: 35,
    overflow: "hidden",
    padding: spacing.xxl + 6,
  },
  title: {
    fontSize: 36,
    fontFamily: "Bebas",
    color: colors.text,
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },

  inviteSection: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  qrSide: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text,
    padding: spacing.xs,
    borderRadius: radius.xs,
    overflow: "hidden",
  },
  codeSide: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },
  codeLabel: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  codeValue: {
    fontSize: 28,
    fontFamily: "Bebas",
    letterSpacing: 6,
    color: colors.text,
  },
  // Async hint
  asyncHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  asyncText: {
    fontSize: fontSize.md,
    color: colors.placeholder,
    flex: 1,
    lineHeight: 20,
  },

  // Actions
  actions: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radius.pill,
  },
  actionBtnContent: {
    paddingVertical: spacing.xs + 2,
  },
  playAgainBtn: {
    flex: 1.5,
  },

  // Waiting modal
  spinnerContainer: {
    paddingVertical: spacing.xxl + 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
