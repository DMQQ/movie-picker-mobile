import { FontAwesome } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { memo, useContext, useEffect } from "react";
import { Dimensions, Share, View } from "react-native";
import { Avatar, Button, MD2DarkTheme, Text, useTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { AVATAR_COLORS } from "../../components/Home/ActiveUsers";
import PageHeading from "../../components/PageHeading";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";

interface RoomSetupParams {
  category: string;
  maxRounds: number;
  genre: { id: number; name: string }[];
  providers: number[];
}

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

export default function QRCodePage({ navigation, route }: any) {
  const { roomSetup }: { roomSetup: RoomSetupParams } = route.params || {};
  const { category, maxRounds, genre, providers } = roomSetup || {};
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
          pageRange: Math.trunc(Math.random() * 5),
          genre: genre?.map((g) => g.id) || [],
          nickname,
          providers: providers || [],
          maxRounds: maxRounds || 6,
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
  }, [category, genre, providers, maxRounds, nickname, socket, dispatch]);

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
    <View style={{ flex: 1 }}>
      <PageHeading title={t("room.qr-title")} />
      <View style={{ position: "relative", flex: 1, padding: 15 }}>
        <Text
          style={{
            fontSize: 16,
            color: "#fff",
          }}
        >
          {t("room.qr-subtitle")}
        </Text>

        <QrCodeBox code={qrCode} />
      </View>
      <View style={{ paddingHorizontal: 15, paddingTop: 15 }}>
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
          value={`flickmate://swipe/${code}`}
          size={Dimensions.get("screen").width * 0.6}
        />
      </View>

      <Button
        icon={() => <FontAwesome name="share" size={24} color={MD2DarkTheme.colors.primary} />}
        onPress={async () => {
          shareCode(code);
        }}
        contentStyle={{ flexDirection: "row-reverse" }}
        style={{ marginTop: 15 }}
      >
        <Text style={{ fontSize: 25, letterSpacing: 1, color: theme.colors.primary }}>{code}</Text>
      </Button>
    </View>
  );
});
