import { router } from "expo-router";
import { useContext } from "react";
import { Dimensions, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";
import QRCode from "react-native-qrcode-svg";
import { roomActions } from "../../redux/room/roomSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { SocketContext } from "../../context/SocketContext";
import useTranslation from "../../service/useTranslation";
import ReviewManager from "../../utils/rate";
import { reset } from "../../redux/roomBuilder/roomBuilderSlice";
import UserInputModal from "../UserInputModal";

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

  const handleLeaveRoom = () => {
    socket?.emit("leave-room", roomId);
    // If game is running the server pushes game:summary → useRoomScreen listener handles navigation.
    // If game already ended, go home and clean up.
    if (!isPlaying) {
      router.replace("/");
      dispatch(roomActions.reset());
      dispatch(reset());
      ReviewManager.onGameComplete(true);
    }
  };

  const t = useTranslation();

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
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: theme.colors.primary,
              borderRadius: radius.sm + 2,
              width: Dimensions.get("screen").width / 2 + 25,
              height: Dimensions.get("screen").width / 2 + 25,
            }}
          >
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
              marginTop: spacing.screen,
              fontSize: fontSize.xl,
              fontWeight: fontWeight.bold,
              letterSpacing: 3,
            }}
          >
            {qrCode}
          </Text>
        </View>
      </UserInputModal>
    </>
  );
}
