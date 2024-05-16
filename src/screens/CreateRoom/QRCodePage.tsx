import { Dimensions, Share, ToastAndroid, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import QRCode from "react-native-qrcode-svg";
import { CommonActions } from "@react-navigation/native";
import { useCreateRoom } from "./ContextProvider";
import * as Clipboard from "expo-clipboard";
import { useContext, useEffect } from "react";
import { SocketContext } from "../../service/SocketContext";
import { roomActions } from "../../redux/room/roomSlice";

export default function QRCodePage({ navigation }: any) {
  const { category, pageRange, genre } = useCreateRoom();
  const { qrCode, room, nickname } = useAppSelector((state) => state.room);
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const theme = useTheme();

  const {
    room: { users },
  } = useAppSelector((state) => state.room);

  useEffect(() => {
    socket?.emit(
      "create-room",
      category,
      pageRange,
      genre.map((g) => g.id),
      nickname
    );

    return () => {
      socket?.off("room-created");
    };
  }, [category, pageRange, genre]);

  useEffect(() => {
    socket?.on("room-created", (roomId) => {
      dispatch(roomActions.setQRCode(roomId));
    });

    return () => {
      socket?.off("room-created");
    };
  }, []);

  useEffect(() => {
    if (!qrCode) return;
    socket?.emit("join-room", qrCode, nickname);

    socket?.on("active", (users: string[]) => {
      dispatch(roomActions.setUsers(users));

      users.length > 1 && onJoinOwnRoom();
    });

    return () => {
      socket?.off("active");
    };
  }, [qrCode]);

  const onJoinOwnRoom = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: {
              roomId: qrCode,
              type: category.includes("movie") ? "movie" : "tv",
            },
          },
        ],
      })
    );
  };

  return (
    <View style={{ position: "relative", flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 25, fontWeight: "bold", marginTop: 25 }}>
        Scan QR Code to join the room or use the code below
      </Text>
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
            borderWidth: 2,
            borderColor: theme.colors.primary,
          }}
        >
          <QRCode
            backgroundColor="#000"
            color={theme.colors.primary}
            value={JSON.stringify({
              roomId: qrCode,
              host: "dmq",
              type: "movies",
            })}
            size={Dimensions.get("screen").width / 1.5}
          />
        </View>

        <Button
          onLongPress={async () => {
            try {
              await Share.share({
                message: qrCode,
                url: `qr-mobile://home/${qrCode}`,
                title: "Share Room Code",
              });
            } catch (error) {}
          }}
          onPress={async () => {
            await Clipboard.setStringAsync(qrCode);
            ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
          }}
        >
          {qrCode}
        </Button>
      </View>

      <View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "400",
            color: "gray",
            marginBottom: 10,
          }}
        >
          Active users: {users.length}
        </Text>

        <Button
          mode="contained"
          style={{
            borderRadius: 100,
            marginTop: 5,
          }}
          contentStyle={{ padding: 7.5 }}
          onPress={() => {
            onJoinOwnRoom();
          }}
        >
          Next
        </Button>
      </View>
    </View>
  );
}
