import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
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
import UserInputModal, { UserInputModalAction } from "../../components/UserInputModal";
import { useIsFocused } from "@react-navigation/native";

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
  spinnerContainer: {
    paddingVertical: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function Home() {
  const params = useLocalSearchParams();
  const { cards, isPlaying, cardsLoading, roomId, joinError, isJoining } = useRoomContext();
  const hasUserPlayed = useAppSelector((state) => state.room.room.hasUserPlayed);
  const gameEnded = useAppSelector((state) => state.room.room.gameEnded);
  const canContinue = useAppSelector((state) => state.room.room.canContinue);
  const isHost = useAppSelector((state) => state.room.isHost);
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const dispatch = useAppDispatch();
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
            dispatch(roomActions.setRoomId((params.roomId as string).toUpperCase()));
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
      if (!canContinue) {
        router.replace({
          pathname: "/room/summary",
          params: { roomId },
        });

        return;
      }
      if (isHost) {
        setShowPlayAgainDialog(true);
      } else {
        setWaitingForHost(true);
      }
    }
  }, [gameEnded, isPlaying, isHost, canContinue]);

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

  const handleEndGame = useCallback(() => {
    if (!socket || !roomId) return;
    socket?.emit("end-game", roomId);
    setShowPlayAgainDialog(false);
    router.replace({
      pathname: "/room/summary",
      params: { roomId },
    });
  }, [socket, roomId]);

  const playAgainActions: UserInputModalAction[] = [
    {
      label: t("dialogs.scan-code.endGame") as string,
      mode: "text" as const,
      textColor: "rgba(255, 100, 100, 0.9)",
      onPress: handleEndGame,
      disabled: playAgainLoading,
    },
    {
      label: t("game-summary.play-again") as string,
      mode: "contained",
      onPress: handlePlayAgain,
      disabled: playAgainLoading,
      loading: playAgainLoading,
    },
  ];

  const waitingActions: UserInputModalAction[] = [
    {
      label: t("game-summary.view-summary") as string,
      mode: "outlined",
      onPress: handleViewSummary,
    },
  ];

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert(
        t("dialogs.leave-room.title") as string,
        t("dialogs.leave-room.message") as string,
        [
          {
            text: t("common.cancel") as string,
            style: "cancel",
          },
          {
            text: t("common.yes") as string,
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ],
        { userInterfaceStyle: "dark", cancelable: true },
      );

      return true;
    });

    return () => sub.remove();
  }, [isFocused]);

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
            {gameEnded ? t("room.finished") : isJoining ? t("room.joining") : cardsLoading ? t("room.loading") : t("room.awaiting-start")}
          </Text>
        </View>
      )}

      <UserInputModal
        visible={showError || joinError}
        title={t("dialogs.qr.error") as string}
        subtitle={t("dialogs.qr.error-desc") as string}
        actions={[
          {
            label: t("dialogs.qr.close") as string,
            mode: "contained",
            onPress: () => {
              setShowError(false);
              router.replace("/(tabs)");
            },
          },
        ]}
      />

      <UserInputModal
        visible={showPlayAgainDialog}
        title={t("game-summary.game-completed") as string}
        subtitle={t("room.play-again-prompt") as string}
        actions={playAgainActions}
        statusBarTranslucent
        maxHeight="50%"
      />

      <UserInputModal
        visible={waitingForHost}
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

      <Matches roomId={params?.roomId as string} />
    </View>
  );
}

interface SwipeContentProps {
  params: Record<string, string | undefined>;
}

const SwipeContent = memo(({ params }: SwipeContentProps) => {
  const { cards, dislikeCard, likeCard, blockAndDislikeCard, superLikeAndLikeCard } = useRoomContext();

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
    [params?.type],
  );

  return cards
    .slice(0, 3)
    .map((card, index) => (
      <SwipeTile
        onPress={() => handleNavigateDetails(card)}
        length={originalLength.current}
        key={card.id}
        card={card}
        index={index}
        likeCard={throttle(() => likeCard(card, index), 500)}
        removeCard={throttle(() => dislikeCard(card, index), 500)}
        blockCard={throttle(() => blockAndDislikeCard(card, index), 500)}
        superLikeCard={throttle(() => superLikeAndLikeCard(card, index), 500)}
      />
    ));
});

const Matches = memo(({ roomId }: { roomId: string }) => {
  const { isFocused, hideMatchModal, match } = useRoomMatches(roomId);

  return isFocused && <MatchModal hideMatchModal={hideMatchModal} match={match} />;
});
