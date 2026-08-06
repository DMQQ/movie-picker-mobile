import { useCallback, useContext, useEffect, useRef } from "react";
import { Alert, BackHandler } from "react-native";
import { router, useIsFocused, useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { SocketContext, url } from "../context/SocketContext";
import useTranslation from "../service/useTranslation";
import envs from "../constants/envs";
import { IGameSummary } from "../components/GameSummary/types";

export default function useRoomScreen() {
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const t = useTranslation();
  const isFocused = useIsFocused();

  const isHost = useAppSelector((state) => state.room.isHost);
  const roomId = useAppSelector((state) => state.room.roomId);
  const isPlaying = useAppSelector((state) => state.room.isPlaying);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Verify room exists before joining. isPlaying read via ref so false→true→false
  // transitions during a game don't re-trigger verification.
  useEffect(() => {
    if (!params?.roomId || isPlayingRef.current) return;

    const controller = new AbortController();
    const verify = async () => {
      try {
        const res = await fetch(`${url}/room/verify/${params.roomId}`, {
          headers: { authorization: `Bearer ${envs.server_auth_token}` },
          signal: controller.signal,
        });
        const data = await res.json();
        if (!data.exists) {
          dispatch(roomActions.setRoomNotFound(true));
          return;
        }
        dispatch(roomActions.setRoomId((params.roomId as string).toUpperCase()));
      } catch (err) {
        if (!controller.signal.aborted) dispatch(roomActions.setRoomNotFound(true));
      }
    };
    verify();
    return () => controller.abort();
  }, [params?.roomId, dispatch]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { roomId: string }) => {
      router.replace({ pathname: "/room/summary", params: { roomId: data.roomId } });
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
      // If game is running the server will push game:summary → handled by the listener below.
      // If game already ended, navigate home.
      if (!isPlaying) {
        router.replace("/");
      }
    }
  }, [isHost, isPlaying, socket, roomId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (summary: IGameSummary) => {
      dispatch(roomActions.setGameSummary(summary));
      router.replace({ pathname: "/room/summary", params: { roomId: summary.roomId } });
    };
    socket.on("game:summary", handler);
    return () => { socket.off("game:summary", handler); };
  }, [socket, dispatch]);

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
}
