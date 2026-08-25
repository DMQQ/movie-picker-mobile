import { router } from "expo-router";
import Text from "../Text";
import { useTheme } from "../../hooks/useTheme";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { colors, fontWeight, spacing } from "../../constants/design";
import QRCode from "../QRCode";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import ReviewManager from "../../utils/rate";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import UserInputModal from "../UserInputModal";
import RoomShareStrip from "../Room/RoomShareStrip";

const QR_SIZE = 100;

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
  const isPlaying = useAppSelector((state) => state.room.isPlaying);
  const t = useTranslation();

  const handleLeaveRoom = () => {
    socket?.emit("leave-room", roomId);
    if (!isPlaying) {
      router.replace("/");
      dispatch(roomActions.reset());
      dispatch(reset());
      ReviewManager.onGameComplete(true);
    }
  };

  return (
    <>
      <UserInputModal
        visible={showLeaveModal}
        onDismiss={toggleLeaveModal}
        title={t("dialogs.leave-room.title")}
        subtitle={t("dialogs.leave-room.message")}
        dismissable
        actions={[
          {
            label: t("dialogs.leave-room.cancel"),
            onPress: toggleLeaveModal,
            mode: "outlined",
          },
          {
            label: t("dialogs.leave-room.leave"),
            onPress: handleLeaveRoom,
            mode: "contained",
          },
        ]}
      />

      <UserInputModal
        visible={showQRModal}
        onDismiss={() => setShowQRModal(false)}
        title={t("dialogs.scan-code.title")}
        subtitle={t("dialogs.scan-code.message")}
        dismissable
        actions={[
          {
            label: t("dialogs.scan-code.close"),
            onPress: () => setShowQRModal(false),
            mode: "contained",
          },
        ]}
      >
        <View style={styles.qrRow}>
          <QRCode
            backgroundColor="transparent"
            color={theme.colors.primary}
            value={`flickmate://room/${qrCode}`}
            size={QR_SIZE}
          />

          <View style={styles.codeBlock}>
            <Text style={[styles.codeValue, { color: theme.colors.primary }]}>
              {qrCode}
            </Text>
            <RoomShareStrip qrCode={qrCode ?? ""} webPath="swipe" roomId={roomId} />
          </View>
        </View>
      </UserInputModal>
    </>
  );
}

const styles = StyleSheet.create({
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    width: "100%",
  },
  codeBlock: {
    flex: 1,
    gap: spacing.sm,
  },
  codeValue: {
    fontSize: 26,
    fontWeight: fontWeight.bold,
    letterSpacing: 6,
  },
});
