import { Appbar, Button, useTheme } from "react-native-paper";
import ActiveUsers from "./ActiveUsers";
import { useContext } from "react";
import { SocketContext } from "../../service/SocketContext";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "../../redux/store";

export default function HomeAppbar({
  toggleLeaveModal,
  setShowQRModal,
  route,
  cards,
}: {
  toggleLeaveModal: () => void;
  setShowQRModal: React.Dispatch<React.SetStateAction<boolean>>;
  showQRModal: boolean;
  route: { params: { roomId: string } };
  cards: any;
}) {
  const theme = useTheme();
  const { socket } = useContext(SocketContext);
  const navigation = useNavigation<any>();

  const {
    room: { isFinished, users },
  } = useAppSelector((state) => state.room);

  return (
    <Appbar.Header style={{ backgroundColor: "#000" }}>
      <Button onPress={toggleLeaveModal}>Leave</Button>

      <ActiveUsers data={users} />

      {!(cards.length > 0) && !isFinished && (
        <Appbar.Action
          color={theme.colors.primary}
          size={22}
          icon="refresh"
          onPress={() => {
            socket?.emit("get-movies", route.params?.roomId);
          }}
        />
      )}

      <Appbar.Action color={theme.colors.primary} size={17} icon="qrcode-scan" onPress={() => setShowQRModal((p) => !p)} />

      <Appbar.Action size={20} color={theme.colors.primary} icon="heart" onPress={() => navigation.navigate("Overview")} />
    </Appbar.Header>
  );
}
