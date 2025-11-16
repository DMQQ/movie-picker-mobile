import { router } from "expo-router";
import { useContext } from "react";
import { Dimensions, View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import ReviewManager from "../../utils/rate";

export default function DialogModals({
  showLeaveModal,
  toggleLeaveModal,
  showQRModal,
  setShowQRModal,
  roomId,
}: {
  showLeaveModal: boolean;
  toggleLeaveModal: () => void;
  showQRModal: boolean;
  setShowQRModal: (a: any) => void;
  roomId: string;
}) {
  const qrCode = useAppSelector((state) => state.room.qrCode);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);
  // navigation removed - using expo-router"

  const handleLeaveRoom = () => {
    router.replace("/");
    socket?.emit("leave-room", roomId);

    dispatch(roomActions.reset());
    ReviewManager.onGameComplete(true);
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
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <QRCode
              backgroundColor={theme.colors.surface}
              color={theme.colors.primary}
              value={`flickmate://room/${qrCode}`}
              size={Dimensions.get("screen").width / 2}
            />
          </View>
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
