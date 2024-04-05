import { useEffect } from "react";
import { Dimensions, View } from "react-native";
import { Button, Text } from "react-native-paper";

import QR from "react-native-qrcode-svg";
import { socket } from "../service/socket";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { CommonActions } from "@react-navigation/native";

const categories = {
  series: [],
  movies: [],
  "top-rated": [],
  popular: "",

  "now-playing": [],
};

export default function QRCode({ navigation }: any) {
  const {
    qrCode,
    room: { users },
  } = useAppSelector((state) => state.room);
  const dispatch = useAppDispatch();

  const handleGenerateCode = () => {
    socket.emit("create-room");

    socket.on("room-created", (roomId) => {
      dispatch(roomActions.setQRCode(roomId));
    });
  };

  useEffect(() => {
    if (!qrCode) return;
    socket.emit("join-room", qrCode);

    socket.on("active", (users: string[]) => {
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
      socket.off("active-users");
      socket.off("active");
    };
  }, [qrCode]);

  useEffect(() => {
    handleGenerateCode();

    return () => {
      socket.off("room-created");
    };
  }, []);

  const onJoinOwnRoom = () => {
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
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
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
        <View style={{ padding: 10, borderWidth: 2, borderColor: "#fff" }}>
          <QR
            backgroundColor="#000"
            color="#fff"
            value={JSON.stringify({
              roomId: qrCode,
              host: "dmq",
              type: "movies",
            })}
            size={Dimensions.get("screen").width / 1.5}
          />
        </View>
        <Text style={{ marginTop: 5, fontWeight: "bold", fontSize: 17 }}>
          {qrCode}
        </Text>
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
          onPress={onJoinOwnRoom}
        >
          Join room
        </Button>
      </View>
    </View>
  );
}
