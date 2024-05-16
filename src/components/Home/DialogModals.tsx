import { Dimensions } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { roomActions } from "../../redux/room/roomSlice";
import { useContext } from "react";
import { SocketContext } from "../../service/SocketContext";

export default function DialogModals({
  showLeaveModal,
  toggleLeaveModal,
  showQRModal,
  setShowQRModal,
  route,
}: {
  showLeaveModal: boolean;
  toggleLeaveModal: () => void;
  showQRModal: boolean;
  setShowQRModal: (a: any) => void;
  route: { params: { roomId: string } };
}) {
  const { qrCode } = useAppSelector((state) => state.room);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  const navigation = useNavigation();

  const handleLeaveRoom = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Landing" }],
      })
    );
    dispatch(roomActions.reset());
    socket?.emit("leave-room", route.params?.roomId);
  };

  return (
    <Portal>
      <Dialog
        visible={showLeaveModal}
        style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}
      >
        <Dialog.Title>Leave Room</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to leave the room?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={toggleLeaveModal}>Cancel</Button>
          <Button onPress={handleLeaveRoom}>Leave</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog
        visible={showQRModal}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 10,
          paddingBottom: 10,
        }}
      >
        <Dialog.Title>QR Code</Dialog.Title>
        <Dialog.Content>
          <Text>Scan this code to join the room</Text>
        </Dialog.Content>

        <Dialog.Content>
          <QRCode
            backgroundColor={theme.colors.surface}
            color={theme.colors.primary}
            value={JSON.stringify({
              roomId: qrCode,
              host: "dmq",
              type: "movies",
            })}
            size={Dimensions.get("screen").width / 1.35}
          />
          <Text
            style={{
              color: theme.colors.primary,
              textAlign: "center",
              marginTop: 5,
              fontSize: 18,
            }}
          >
            {qrCode}
          </Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={() => setShowQRModal(false)}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
