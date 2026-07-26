import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Alert, BackHandler, StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import RoomLoader from "../../components/RoomLoader";
import RoomEmptyState from "../../components/RoomEmptyState";
import { FancySpinner } from "../../components/FancySpinner";
import HomeAppbar from "../../components/Home/Appbar";
import MatchModal from "../../components/Movie/MatchModal";
import SwipeTile from "../../components/Movie/SwipeTiles";
import TabBar from "../../components/Home/TabBar";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import useRoomContext from "../../context/RoomContext";
import { roomActions } from "../../redux/room/roomSlice";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import useRoomMatches from "../../service/useRoomMatches";
import { url, SocketContext } from "../../context/SocketContext";
import envs from "../../constants/envs";
import UserInputModal, {
  UserInputModalAction,
} from "../../components/UserInputModal";
import { useIsFocused } from "expo-router";
import SwipeHintOverlay from "../../components/SwipeHintOverlay";

const styles = StyleSheet.create({
  spinnerContainer: {
    paddingVertical: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function Home() {
  const params = useLocalSearchParams();
  const cards = useAppSelector((state) => state.room.room.movies);
  const isPlaying = useAppSelector((state) => state.room.isPlaying);
  const roomId = useAppSelector((state) => state.room.room.roomId);
  const joinError = useAppSelector((state) => state.room.joinError);
  const isJoining = useAppSelector((state) => state.room.isJoining);
  const hasUserPlayed = useAppSelector(
    (state) => state.room.room.hasUserPlayed,
  );
  const gameEnded = useAppSelector((state) => state.room.room.gameEnded);
  const canContinue = useAppSelector((state) => state.room.room.canContinue);
  const isHost = useAppSelector((state) => state.room.isHost);
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const roomIdStr = (params?.roomId as string) ?? "";
  const mediaType = (params?.type as string) || "movie";

  const [showRoomError, setShowRoomError] = useState(false);

  useEffect(() => {
    if (!params?.roomId || isPlaying) return;

    const controller = new AbortController();
    const verify = async () => {
      try {
        const res = await fetch(`${url}/room/verify/${params.roomId}`, {
          headers: { authorization: `Bearer ${envs.server_auth_token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!data.exists) {
          setShowRoomError(true);
          return;
        }
        dispatch(
          roomActions.setRoomId((params.roomId as string).toUpperCase()),
        );
      } catch (err) {
        if (!controller.signal.aborted) setShowRoomError(true);
      }
    };
    verify();
    return () => controller.abort();
  }, [params?.roomId, dispatch, isPlaying]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { roomId: string }) => {
      router.replace({
        pathname: "/room/summary",
        params: { roomId: data.roomId },
      });
    };
    socket.on("game:ended-by-host", handler);
    return () => { socket.off("game:ended-by-host", handler); };
  }, [socket]);

  const handleLeaveRoom = useCallback(() => {
    if (isHost) {
      socket?.emit("end-game", roomId);
      router.replace({ pathname: "/room/summary", params: { roomId } });
    } else {
      socket?.emit("leave-room", roomId);
      router.replace("/");
    }
  }, [isHost, socket, roomId]);

  useEffect(() => {
    if (!isFocused) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert(
        t("dialogs.leave-room.title") as string,
        t("dialogs.leave-room.message") as string,
        [
          { text: t("common.cancel") as string, style: "cancel" },
          { text: t("common.yes") as string, onPress: handleLeaveRoom },
        ],
        { userInterfaceStyle: "dark", cancelable: true },
      );
      return true;
    });
    return () => sub.remove();
  }, [isFocused, handleLeaveRoom, t]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <HomeAppbar roomId={roomIdStr} hasCards={cards.length > 0} />

      {isPlaying ? (
        <>
          <SwipeContent mediaType={mediaType} />
          {cards.length > 0 && <SwipeHintOverlay />}
          {cards.length === 0 && (
            <RoomEmptyState
              gameEnded={gameEnded}
              hasUserPlayed={hasUserPlayed}
            />
          )}
        </>
      ) : (
        <RoomLoader
          label={
            gameEnded
              ? (t("room.finished") as string)
              : isJoining
                ? (t("room.joining") as string)
                : (t("room.awaiting-start") as string)
          }
        />
      )}

      <RoomErrorModal
        visible={showRoomError || joinError}
        onClose={() => {
          setShowRoomError(false);
          router.replace("/(tabs)");
        }}
      />

      <GameEndFlow
        roomId={roomId}
        isHost={isHost}
        gameEnded={gameEnded}
        isPlaying={isPlaying}
        canContinue={canContinue}
      />

      <Matches roomId={roomIdStr} />
    </View>
  );
}


const RoomErrorModal = memo(
  ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    const t = useTranslation();
    const actions = useMemo<UserInputModalAction[]>(
      () => [
        {
          label: t("dialogs.qr.close") as string,
          mode: "contained",
          onPress: onClose,
        },
      ],
      [t, onClose],
    );

    return (
      <UserInputModal
        visible={visible}
        title={t("dialogs.qr.error") as string}
        subtitle={t("dialogs.qr.error-desc") as string}
        actions={actions}
      />
    );
  },
);


interface GameEndFlowProps {
  roomId: string;
  isHost: boolean;
  gameEnded: boolean;
  isPlaying: boolean;
  canContinue: boolean;
}

const GameEndFlow = memo(
  ({ roomId, isHost, gameEnded, isPlaying, canContinue }: GameEndFlowProps) => {
    const { socket } = useContext(SocketContext);
    const t = useTranslation();
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [waiting, setWaiting] = useState(false);

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
  },
);


const SwipeContent = memo(({ mediaType }: { mediaType: string }) => {
  const cards = useAppSelector((state) => state.room.room.movies);
  const {
    dislikeCard,
    likeCard,
    blockAndDislikeCard,
    superLikeAndLikeCard,
  } = useRoomContext();

  const t = useTranslation();
  const originalLength = useRef(cards.length);
  const dragProgress = useSharedValue(0);
  const buttonSwipe = useSharedValue(0);
  const [isPending, startTransition] = useTransition();
  const busy = useRef(false);

  useEffect(() => {
    busy.current = false;
  }, [cards]);

  const swipe = useCallback(
    (dir: number, fn: () => void) => {
      if (busy.current || isPending || cards.length === 0) return;
      busy.current = true;
      buttonSwipe.value = dir;
      startTransition(() => {
        fn();
      });
    },
    [isPending, cards.length, buttonSwipe],
  );

  const topCard = cards[0];

  return (
    <>
      {cards.slice(0, 3).map((card, index) => (
        <SwipeTile
          href={{
            pathname: "/movie/type/[type]/[id]",
            params: {
              id: card.id,
              type: mediaType,
              img: card.poster_path,
            },
          }}
          length={originalLength.current}
          key={card.id}
          card={card}
          index={index}
          dragProgress={dragProgress}
          buttonSwipe={index === 0 ? buttonSwipe : undefined}
          likeCard={() => likeCard(card, index)}
          removeCard={() => dislikeCard(card, index)}
          blockCard={() => blockAndDislikeCard(card, index)}
          superLikeCard={() => superLikeAndLikeCard(card, index)}
        />
      ))}
      {topCard && (
        <TabBar
          zIndex={0}
          disabled={isPending}
          likeCard={() => swipe(1, () => likeCard(topCard, 0))}
          removeCard={() => swipe(-1, () => dislikeCard(topCard, 0))}
          openInfo={() =>
            router.push({
              pathname: "/movie/type/[type]/[id]",
              params: {
                id: topCard.id,
                type: mediaType,
                img: topCard.poster_path,
              },
            })
          }
          blockCard={() =>
            swipe(-2, () => blockAndDislikeCard(topCard, 0))
          }
          superLikeCard={() =>
            swipe(2, () => superLikeAndLikeCard(topCard, 0))
          }
          labels={{
            block: t("swipe.block") as string,
            dislike: t("swipe.nope") as string,
            like: t("swipe.like") as string,
            superLike: t("swipe.super") as string,
          }}
        />
      )}
    </>
  );
});


const Matches = memo(({ roomId }: { roomId: string }) => {
  const { isFocused, hideMatchModal, match } = useRoomMatches(roomId);
  return (
    isFocused && <MatchModal hideMatchModal={hideMatchModal} match={match} />
  );
});
