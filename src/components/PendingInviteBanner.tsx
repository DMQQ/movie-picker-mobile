import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
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
} from "../constants/design";
import Text from "./Text";
import useTranslation from "../service/useTranslation";

export default function PendingInviteBanner() {
  const token = useAppSelector((s) => s.auth.token);
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { data, error } = useGetPendingInvitesQuery(
    token ? undefined : skipToken,
    {
      pollingInterval: 30_000,
    },
  );

  const [acceptInvite] = useAcceptInviteMutation();
  const [declineInvite] = useDeclineInviteMutation();

  const pending =
    data?.invites?.filter((inv) => inv.status === "pending") ?? [];

  const handleAccept = async (invite: Invite) => {
    try {
      await acceptInvite({ id: invite.id, joinMethod: "manual" }).unwrap();
      if (invite.gameType === "voter") {
        router.replace({
          pathname: "/voter",
          params: { sessionId: invite.roomId, inviteId: invite.id },
        });
      } else {
        router.replace({
          pathname: "/room/[roomId]",
          params: { roomId: invite.roomId, inviteId: invite.id },
        });
      }
    } catch {}
  };

  const handleDecline = (invite: Invite) => {
    declineInvite(invite.id);
  };

  console.log(pending, token, error);

  if (pending.length === 0) return null;

  const invite = pending[0];
  const isVoter = invite.gameType === "voter";

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutUp}
      style={[styles.container, { top: insets.top + spacing.sm }]}
    >
      <Pressable style={styles.banner} onPress={() => handleAccept(invite)}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name={isVoter ? "vote" : "cards-playing-heart-multiple"}
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.title}>
            {isVoter
              ? (t("room.invite.banner.voter") as string)
              : (t("room.invite.banner.swipe") as string)}
          </Text>
          <Text style={styles.subtitle}>
            {t("room.invite.banner.join") as string}
          </Text>
        </View>

        <Pressable
          style={styles.dismissBtn}
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            handleDecline(invite);
          }}
        >
          <MaterialCommunityIcons
            name="close"
            size={18}
            color={colors.placeholder}
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primary + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  textBox: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    color: colors.placeholder,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
});
