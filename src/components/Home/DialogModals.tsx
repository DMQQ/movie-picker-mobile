import { Dimensions } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { store, useAppDispatch, useAppSelector } from "../../redux/store";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { roomActions } from "../../redux/room/roomSlice";
import { useContext } from "react";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";

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

  const t = useTranslation();

  return (
    <Portal>
      <Dialog visible={showLeaveModal} style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}>
        <Dialog.Title>{t("dialogs.leave-room.title")}</Dialog.Title>
        <Dialog.Content>
          <Text>{t("dialogs.leave-room.message")}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={toggleLeaveModal}>{t("dialogs.leave-room.cancel")}</Button>
          <Button onPress={handleLeaveRoom}>{t("dialogs.leave-room.leave")}</Button>
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
        <Dialog.Title>{t("dialogs.scan-code.title")}</Dialog.Title>
        <Dialog.Content>
          <Text>{t("dialogs.scan-code.message")}</Text>
        </Dialog.Content>

        <Dialog.Content>
          <QRCode
            backgroundColor={theme.colors.surface}
            color={theme.colors.primary}
            value={`flickmate://swipe/${qrCode}`}
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
          <Button onPress={() => setShowQRModal(false)}>{t("dialogs.scan-code.close")}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
