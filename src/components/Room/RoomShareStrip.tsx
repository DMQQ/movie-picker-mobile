import { memo, useCallback, useContext, useState } from "react";
import { Share, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Notifications from "expo-notifications";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { SocketContext } from "../../context/SocketContext";
import Text from "../Text";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";

interface RoomShareStripProps {
  qrCode: string;
  webPath?: string;
  roomId?: string;
}

const RoomShareStrip = memo(({ qrCode, webPath = "swipe", roomId }: RoomShareStripProps) => {
  const { colors: themeColors } = useTheme();
  const { socket } = useContext(SocketContext);
  const [hasShared, setHasShared] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  const handleShare = useCallback(async () => {
    const code = qrCode.toUpperCase();
    const url = `https://flickmate.app/${webPath}/${code}`;
    await Share.share({ message: `Join my Flickmate room! Code: ${code}\n${url}`, url });
    setHasShared(true);
  }, [qrCode, webPath]);

  const handleNotify = useCallback(async () => {
    if (notifyEnabled) {
      setNotifyEnabled(false);
      socket?.emit("room:notify-on-match", { roomId, enabled: false });
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    const granted =
      status === "granted" ||
      (await Notifications.requestPermissionsAsync()).status === "granted";
    if (!granted) return;
    setNotifyEnabled(true);
    socket?.emit("room:notify-on-match", { roomId, enabled: true });
  }, [notifyEnabled, socket, roomId]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.strip}>
        <TouchableOpacity style={styles.btn} onPress={handleShare} activeOpacity={0.7}>
          <MaterialCommunityIcons name="share-variant-outline" size={20} color={colors.text} />
          <Text style={styles.label}>Share</Text>
        </TouchableOpacity>

        {hasShared && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.btn} onPress={handleNotify} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name={notifyEnabled ? "bell-ring" : "bell-outline"}
                size={20}
                color={notifyEnabled ? themeColors.primary : colors.text}
              />
              <Text style={[styles.label, notifyEnabled && { color: themeColors.primary }]}>
                {notifyEnabled ? "Notifying" : "Notify me"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {hasShared && (
        <Text style={styles.hint}>
          {notifyEnabled
            ? "You'll get a push notification when a player matches with you."
            : "Want a notification when someone joins and matches with you?"}
        </Text>
      )}
    </View>
  );
});

export default RoomShareStrip;

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
    width: "100%",
  },
  strip: {
    flexDirection: "row",
    backgroundColor: colors.input,
    borderRadius: radius.md,
    overflow: "hidden",
    width: "100%",
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    lineHeight: 16,
  },
});
