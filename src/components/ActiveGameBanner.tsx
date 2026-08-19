import { Pressable, StyleSheet } from "react-native";
import Text from "./Text";
import { colors, fontWeight, fontSize, radius, spacing} from "../constants/design";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGetActiveRoomQuery } from "../redux/room/roomApi";
import useTranslation from "../service/useTranslation";

export default function ActiveGameBanner() {
  const t = useTranslation();
  const { data } = useGetActiveRoomQuery();

  const room = data?.room;
  if (!room || room.participantCount <= 1 || room.isEnded) return null;

  return (
    <Pressable
      style={styles.banner}
      onPress={() => {
        if (room.type === "voter") {
          router.push({ pathname: "/voter", params: { sessionId: room.roomId } });
        } else if (room.type === "either-or") {
          router.push({ pathname: "/either-or/[roomId]", params: { roomId: room.roomId } });
        } else {
          router.push({ pathname: "/room/[roomId]", params: { roomId: room.roomId } });
        }
      }}
    >
      <MaterialCommunityIcons
        name="play-circle-outline"
        size={18}
        color={colors.text}
      />
      <Text style={styles.text}>
        {t("room.active-game-banner") as string}
        {"  "}
        <Text style={styles.code}>{room.roomId}</Text>
        {"  "}
        <Text>with {room.participantCount} players</Text>
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color="rgba(255,255,255,0.5)"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm + 2,
    marginBottom: spacing.screen,
  },
  text: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md - 1,
    fontWeight: fontWeight.medium,
  },
  code: {
    color: "#a78bfa",
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
});
