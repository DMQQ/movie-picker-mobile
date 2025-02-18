import { Dimensions, Platform, Share, ToastAndroid, View } from "react-native";
import { Appbar, Avatar, Button, Text, useTheme } from "react-native-paper";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import QRCode from "react-native-qrcode-svg";
import { CommonActions, useIsFocused } from "@react-navigation/native";
import { useCreateRoom } from "./ContextProvider";
import * as Clipboard from "expo-clipboard";
import { memo, useContext, useEffect } from "react";
import { SocketContext } from "../../service/SocketContext";
import { roomActions } from "../../redux/room/roomSlice";
import { AVATAR_COLORS } from "../../components/Home/ActiveUsers";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";

interface ISocketResponse {
  roomId: string;
  details: {
    type: "movie" | "tv";
    page: number;
    genres: number[];
    host: string;
    id: string;
    users: string[];
  };
}

export default function QRCodePage({ navigation }: any) {
  const { category, pageRange, genre, providers } = useCreateRoom();
  const { qrCode, nickname } = useAppSelector((state) => state.room);
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);

  const {
    room: { users, roomId },
  } = useAppSelector((state) => state.room);

  useEffect(() => {
    (async () => {
      try {
        const response = (await socket?.emitWithAck("create-room", {
          type: category,
          pageRange,
          genre: genre.map((g) => g.id),
          nickname,
          providers,
        })) as ISocketResponse;

        if (response) {
          dispatch(roomActions.setRoom(response.details));
          dispatch(roomActions.setQRCode(response.roomId));

          socket?.emit("join-room", response.roomId, nickname);

          socket?.on("active", (users: string[]) => {
            dispatch(roomActions.setActiveUsers(users));
          });
        }
      } catch (error) {}
    })();
  }, [category, pageRange, genre]);

  const onJoinOwnRoom = (code: string) => {
    socket?.emit("room:start", roomId);
    dispatch(roomActions.setPlaying(true));
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: {
              roomId: code,
              type: category.includes("movie") ? "movie" : "tv",
            },
          },
        ],
      })
    );
  };

  const t = useTranslation();

  return (
    <SafeIOSContainer>
      <Appbar style={{ backgroundColor: "#000" }}>
        <Appbar.BackAction onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Landing"))} />
        <Appbar.Content title="Join game" />
      </Appbar>
      <View style={{ position: "relative", flex: 1, padding: 15 }}>
        <Text style={{ fontSize: 45, fontFamily: "Bebas", lineHeight: 45 }}>{t("room.qr-title")}</Text>

        <Text
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {t("room.qr-subtitle")}
        </Text>

        <QrCodeBox code={qrCode} />

        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
              height: 25,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16 }}>{t("room.active")}:</Text>
            <View style={{ flexDirection: "row", gap: 5 }}>
              {users.map((nick, index) => (
                <View
                  key={nick + index}
                  style={{
                    flexDirection: "row",
                    backgroundColor: "#000",
                    gap: 5,
                    borderRadius: 100,
                    alignItems: "center",
                  }}
                >
                  <Avatar.Text size={25} label={nick[0].toUpperCase()} style={{ backgroundColor: AVATAR_COLORS[index % 5] }} />
                </View>
              ))}
            </View>
          </View>

          <Button
            mode="contained"
            style={{
              borderRadius: 100,
              marginTop: 10,
            }}
            contentStyle={{ padding: 7.5 }}
            onPress={() => {
              onJoinOwnRoom(qrCode);
            }}
          >
            start
          </Button>
        </View>
      </View>
    </SafeIOSContainer>
  );
}

const QrCodeBox = memo(({ code }: { code: string }) => {
  const { nickname } = useAppSelector((state) => state.room);
  const theme = useTheme();

  const shareCode = async (code: string) => {
    Share.share({
      message: "Hey! Join my room on Movie Picker: " + code,
      title: "Join my room on Movie Picker",
      url: "https://movie.dmqq.dev/swipe/" + code.toUpperCase(),
    });
  };

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <View
        style={{
          padding: 10,
          borderColor: theme.colors.primary,
          borderWidth: 5,
        }}
      >
        <QRCode
          backgroundColor={theme.colors.surface}
          color={theme.colors.primary}
          value={JSON.stringify({
            roomId: code,
            host: nickname,
            type: "movie-picker",
          })}
          size={Dimensions.get("screen").width * 0.6}
        />
      </View>

      <Button
        onLongPress={async () => {
          shareCode(code);
        }}
        onPress={async () => {
          await Clipboard.setStringAsync(code);
          ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
        }}
      >
        <Text style={{ fontSize: 25, letterSpacing: 1, color: theme.colors.primary }}>{code}</Text>
      </Button>
    </View>
  );
});
