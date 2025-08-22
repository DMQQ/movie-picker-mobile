import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Appbar, Button, useTheme } from "react-native-paper";
import { useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import ActiveUsers from "./ActiveUsers";

const SmallButton = ({ children, onPress, icon, style }: { children?: string; onPress: () => void; icon?: string; style?: any }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.smallButton,
        {
          backgroundColor: `${theme.colors.primary}33`,
          borderColor: `${theme.colors.primary}66`,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <MaterialCommunityIcons name={icon as any} size={14} color={theme.colors.primary} style={[children && styles.buttonIcon]} />
        )}
        {children && <Text style={[styles.buttonText, { color: theme.colors.primary }]}>{children}</Text>}
      </View>
    </TouchableOpacity>
  );
};

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
    isPlaying,
    isHost,
  } = useAppSelector((state) => state.room);

  const t = useTranslation();

  const handleEndGame = () => {
    const roomId = route.params?.roomId;
    socket?.emit("end-game", roomId);
    navigation.replace("GameSummary", { roomId });
  };

  return (
    <View style={{ backgroundColor: "#000", marginTop: 0, flexDirection: "row", padding: 10, alignItems: "center" }}>
      {isHost ? (
        <Button onPress={handleEndGame} buttonColor="transparent" textColor="#ff4444">
          {t("dialogs.scan-code.endGame")}
        </Button>
      ) : (
        <Button onPress={toggleLeaveModal}>{t("dialogs.scan-code.leave")}</Button>
      )}

      <ActiveUsers data={users} />

      {!(cards.length > 0) && !isFinished && isPlaying && (
        <Appbar.Action
          color={theme.colors.primary}
          size={22}
          icon="refresh"
          onPress={() => {
            socket?.emit("get-movies", route.params?.roomId);
          }}
        />
      )}

      <SmallButton icon="qrcode-scan" onPress={() => setShowQRModal((p) => !p)} style={{ marginRight: 10 }} />

      <SmallButton icon="heart" onPress={() => navigation.navigate("Overview")}>
        {t("voter.home.likes")}
      </SmallButton>
    </View>
  );
}

const styles = StyleSheet.create({
  smallButton: {
    height: 30,
    paddingHorizontal: 12.5,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "500",
    includeFontPadding: false,
  },
});
