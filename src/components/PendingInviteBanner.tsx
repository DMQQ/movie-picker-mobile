import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetPendingInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
  type Invite,
} from "../redux/invite/inviteApi";
import { useAppSelector } from "../redux/store";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
  withAlpha,
} from "../constants/design";
import Text from "./Text";
import useTranslation from "../service/useTranslation";
import { routeToGameByInvite } from "../utils/inviteRouter";

export default function PendingInviteBanner() {
  const token = useAppSelector((s) => s.auth.token);
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { data } = useGetPendingInvitesQuery(
    token ? undefined : skipToken,
    { pollingInterval: 30_000 },
  );

  const [acceptInvite] = useAcceptInviteMutation();
  const [declineInvite] = useDeclineInviteMutation();

  const pending =
    data?.invites?.filter((inv) => inv.status === "pending") ?? [];

  const handleAccept = async (invite: Invite) => {
    try {
      await acceptInvite({ id: invite.id, joinMethod: "manual" }).unwrap();
      routeToGameByInvite({
        inviteId: invite.id,
        roomId: invite.roomId,
        gameType: invite.gameType || "swipe",
      });
    } catch {}
  };

  const handleDecline = (invite: Invite) => {
    declineInvite(invite.id);
  };

  if (pending.length === 0) return null;

  const invite = pending[0];
  const gameType = invite.gameType ?? "swipe";
  const iconName =
    gameType === "voter"
      ? "vote"
      : gameType === "either-or"
        ? "swap-horizontal"
        : "cards-playing-heart-multiple";
  const bannerText =
    gameType === "voter"
      ? (t("room.invite.banner.voter") as string)
      : gameType === "either-or"
        ? (t("room.invite.banner.either-or") as string)
        : (t("room.invite.banner.swipe") as string);

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutUp}
      style={[styles.container, { top: insets.top + spacing.sm }]}
    >
      <Pressable style={styles.banner} onPress={() => handleAccept(invite)}>
        <MaterialCommunityIcons
          name={iconName}
          size={18}
          color={colors.primary}
        />
        <Text style={styles.text} numberOfLines={2}>
          {bannerText}
        </Text>
        <Pressable
          hitSlop={10}
          onPress={(e) => {
            e.stopPropagation();
            handleDecline(invite);
          }}
        >
          <MaterialCommunityIcons
            name="close"
            size={16}
            color="rgba(255,255,255,0.4)"
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    backgroundColor: withAlpha(colors.primary, 0.08),
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: radius.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    flex: 1,
    fontSize: fontSize.md - 1,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
