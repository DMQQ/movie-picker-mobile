import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Modal, Platform, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import { Movie } from "../../../types";
import { FancySpinner } from "../../components/FancySpinner";
import HomeAppbar from "../../components/Home/Appbar";
import MatchModal from "../../components/Movie/MatchModal";
import SwipeTile from "../../components/Movie/SwipeTiles";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import { throttle } from "../../utils/throttle";
import useRoomMatches from "../../service/useRoomMatches";
import { roomActions } from "../../redux/room/roomSlice";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import useRoomContext from "../../context/RoomContext";
import { url, SocketContext } from "../../context/SocketContext";
import envs from "../../constants/envs";
import FrostedGlass from "../../components/FrostedGlass";
import PlatformBlurView from "../../components/PlatformBlurView";

const styles = StyleSheet.create({
  navigation: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 40,
    fontFamily: "Bebas",
    color: "#fff",
    width: "80%",
    textAlign: "center",
  },
  gameStatus: { fontSize: 20, width: "80%", textAlign: "center" },
  gameFinishStatus: { fontSize: 20, marginTop: 15, textAlign: "center", width: "80%" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: Dimensions.get("window").width - 30,
    overflow: "hidden",
    borderRadius: 40,
    maxHeight: "50%",

    ...Platform.select({
      android: {
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.18)",
      },
    }),
  },
  modalInner: {
    padding: 15,
    paddingTop: 30,
  },
  modalTitle: {
    fontSize: 42,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  modalText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    borderRadius: 100,
    overflow: "hidden",
  },
  buttonContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  waitingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  spinnerContainer: {
    paddingVertical: 35,
  },
});

export default function Home() {
  const params = useLocalSearchParams();
  const { cards, isPlaying, cardsLoading, roomId } = useRoomContext();
  const hasUserPlayed = useAppSelector((state) => state.room.room.hasUserPlayed);
  const gameEnded = useAppSelector((state) => state.room.room.gameEnded);
  const isHost = useAppSelector((state) => state.room.isHost);
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [showError, setShowError] = useState(false);
  const [showPlayAgainDialog, setShowPlayAgainDialog] = useState(false);
  const [playAgainLoading, setPlayAgainLoading] = useState(false);
  const [waitingForHost, setWaitingForHost] = useState(false);

  useEffect(() => {
    const verifyAndJoinRoom = async () => {
      if (params?.roomId && !isPlaying) {
        try {
          const response = await fetch(`${url}/room/verify/${params.roomId}`, {
            headers: {
              authorization: `Bearer ${envs.server_auth_token}`,
            },
          });

          const data = await response.json();

          if (!data.exists) {
            setShowError(true);
            return;
          }

          let timeout = setTimeout(() => {
            dispatch(roomActions.setRoomId(params.roomId as string));
          }, 1);

          return () => clearTimeout(timeout);
        } catch (error) {
          console.error("Failed to verify room:", error);
          setShowError(true);
        }
      }
    };

    verifyAndJoinRoom();
  }, [params?.roomId, dispatch]);

  useEffect(() => {
    if (!socket) return;

    const handleGameEndedByHost = (data: { roomId: string }) => {
      router.replace({
        pathname: "/room/summary",
        params: { roomId: data.roomId },
      });
    };

    socket.on("game:ended-by-host", handleGameEndedByHost);

    return () => {
      socket.off("game:ended-by-host", handleGameEndedByHost);
    };
  }, [socket]);

  useEffect(() => {
    if (gameEnded && isPlaying === false) {
      if (isHost) {
        setShowPlayAgainDialog(true);
      } else {
        setWaitingForHost(true);
      }
    }
  }, [gameEnded, isPlaying, isHost]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomStateUpdate = (data: any) => {
      if (data.gameEnded === false) {
        dispatch(roomActions.setRoom(data));
        setShowPlayAgainDialog(false);
        setWaitingForHost(false);
        setPlayAgainLoading(false);
      }
    };

    socket.on("room:state", handleRoomStateUpdate);

    return () => {
      socket.off("room:state", handleRoomStateUpdate);
    };
  }, [socket, dispatch]);

  const handlePlayAgain = useCallback(async () => {
    if (!socket || !roomId) return;

    setPlayAgainLoading(true);

    try {
      const response = await socket.emitWithAck("play-again", roomId);

      if (!response.success) {
        alert(response.error || t("game-summary.play-again-failed"));
        setPlayAgainLoading(false);
      }
    } catch (error) {
      console.error("Play again failed:", error);
      setPlayAgainLoading(false);
    }
  }, [socket, roomId]);

  const handleViewSummary = useCallback(() => {
    setShowPlayAgainDialog(false);
    setWaitingForHost(false);
    router.replace({
      pathname: "/room/summary",
      params: { roomId: roomId },
    });
  }, [roomId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <HomeAppbar roomId={params?.roomId as string} hasCards={cards.length > 0} />

      {isPlaying ? (
        <>
          <SwipeContent params={params as any} />

          {cards.length === 0 && !cardsLoading && (
            <View style={styles.emptyListContainer}>
              {!gameEnded && hasUserPlayed && <Text style={styles.noResultsText}>{t("room.no-more-results")}</Text>}
              <Text style={styles.gameStatus}>{gameEnded ? t("room.finished") : t("room.waiting")}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyListContainer}>
          <FancySpinner />
          <Text style={styles.gameFinishStatus}>
            {gameEnded ? t("room.finished") : cardsLoading ? t("room.loading") : t("room.awaiting-start")}
          </Text>
        </View>
      )}

      <Portal>
        <Dialog dismissable={false} visible={showError} style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}>
          <Dialog.Title>{t("dialogs.qr.error")}</Dialog.Title>

          <Dialog.Content>
            <Text>{t("dialogs.qr.error-desc")}</Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowError(false);
                router.replace("/(tabs)");
              }}
            >
              {t("dialogs.qr.close")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Modal visible={showPlayAgainDialog} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <PlatformBlurView style={styles.modalContent}>
            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>{t("game-summary.game-completed")}</Text>
              <Text style={styles.modalText}>{t("room.play-again-prompt")}</Text>

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleViewSummary}
                  disabled={playAgainLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {t("game-summary.view-summary")}
                </Button>

                <Button
                  mode="contained"
                  onPress={handlePlayAgain}
                  disabled={playAgainLoading}
                  loading={playAgainLoading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  {t("game-summary.play-again")}
                </Button>
              </View>
            </View>
          </PlatformBlurView>
        </View>
      </Modal>

      <Modal visible={waitingForHost} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <PlatformBlurView style={styles.modalContent}>
            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>{t("game-summary.game-completed")}</Text>

              <View style={styles.spinnerContainer}>
                <FancySpinner size={60} />
              </View>
              <Text style={styles.modalText}>{t("room.waiting-for-host-decision")}</Text>

              <View style={styles.buttonContainer}>
                <Button mode="outlined" onPress={handleViewSummary} style={styles.button} contentStyle={styles.buttonContent}>
                  {t("game-summary.view-summary")}
                </Button>
              </View>
            </View>
          </PlatformBlurView>
        </View>
      </Modal>

      <Matches roomId={params?.roomId as string} />
    </View>
  );
}

interface SwipeContentProps {
  params: Record<string, string | undefined>;
}

const SwipeContent = memo(({ params }: SwipeContentProps) => {
  const { cards, dislikeCard, likeCard } = useRoomContext();

  const originalLength = useRef(cards.length);

  const handleNavigateDetails = useCallback(
    (card: Movie) => {
      router.push({
        pathname: "/movie/type/[type]/[id]",
        params: {
          id: card.id,
          type: params?.type || "movie",
          img: card.poster_path,
        },
      });
    },
    [params?.type]
  );

  return cards.map((card, index) => (
    <SwipeTile
      onPress={() => handleNavigateDetails(card)}
      length={originalLength.current}
      key={card.id}
      card={card}
      index={index}
      likeCard={throttle(() => likeCard(card, index), 500)}
      removeCard={throttle(() => dislikeCard(card, index), 500)}
    />
  ));
});

const Matches = memo(({ roomId }: { roomId: string }) => {
  const { isFocused, hideMatchModal, match } = useRoomMatches(roomId);

  return isFocused && <MatchModal hideMatchModal={hideMatchModal} match={match} />;
});
