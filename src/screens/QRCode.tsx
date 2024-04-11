import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Dimensions, Share, ToastAndroid, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import QR from "react-native-qrcode-svg";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { CommonActions } from "@react-navigation/native";
import { SocketContext } from "../service/SocketContext";
import * as Clipboard from "expo-clipboard";
import Category from "../components/QRCode/Category";

type TOption =
  | "category"
  | "genre"
  | "randomize-page"
  | "randomize-movie"
  | "randomize-tv"
  | "qr-code";

const options = [
  "category",
  "genre",
  // "randomize-page",
  // "randomize-movie",
  // "randomize-tv",
  "qr-code",
] as TOption[];

export default function QRCode({ navigation }: any) {
  const {
    qrCode,
    room: { users },
  } = useAppSelector((state) => state.room);
  const { socket } = useContext(SocketContext);
  const dispatch = useAppDispatch();
  const [category, setCategory] = useState("");
  const [pageRange, setPageRange] = useState("1"); // to randomize the page on first load
  const theme = useTheme();

  const [option, setOption] = useState<TOption>("category");

  const onNextOption = () => {
    const index = options.findIndex((o) => o === option);

    setOption(options[index + 1] || options[0]);
  };

  const handleGenerateCode = (category: string) => {
    socket?.emit("create-room", category, pageRange);
  };

  useEffect(() => {
    socket?.on("room-created", (roomId) => {
      dispatch(roomActions.setQRCode(roomId));
    });

    if (!qrCode) return;
    socket?.emit("join-room", qrCode);

    socket?.on("active", (users: string[]) => {
      dispatch(roomActions.setUsers(users));

      users.length > 1 &&
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "Home",
                params: {
                  roomId: qrCode,
                },
              },
            ],
          })
        );
    });

    return () => {
      socket?.off("active");
      socket?.off("room-created");
    };
  }, [qrCode]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          icon="refresh"
          onPress={() => {
            socket?.emit("delete-room", qrCode);
            handleGenerateCode(category);

            ToastAndroid.show("Room code refreshed", ToastAndroid.SHORT);
          }}
        >
          Reset
        </Button>
      ),
    });
  }, [category, qrCode]);

  const onJoinOwnRoom = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: {
              roomId: qrCode,
              //type: category.includes("movie") ? "movie" : "tv",
            },
          },
        ],
      })
    );
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      {option === "category" && (
        <Category
          setCategory={setCategory}
          handleGenerateCode={handleGenerateCode}
          onNextOption={onNextOption}
          pageRange={pageRange}
          setPageRange={setPageRange}
        />
      )}

      {option === "genre" && <Text>Genre</Text>}

      {option === "qr-code" && (
        <View style={{ position: "relative", flex: 1 }}>
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
              <QR
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
              contentStyle={{ padding: 5 }}
              style={{ borderRadius: 10 }}
              onPress={onJoinOwnRoom}
            >
              Join room
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
