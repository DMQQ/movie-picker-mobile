import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetPendingInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} from "../redux/invite/inviteApi";
import { useAppSelector } from "../redux/store";
import { useToast } from "./Toast";
import useTranslation from "../service/useTranslation";

export default function InviteToastWatcher() {
  const token = useAppSelector((s) => s.auth.token);
  const t = useTranslation();
  const toast = useToast();
  const { data } = useGetPendingInvitesQuery(
    token ? undefined : skipToken,
    { pollingInterval: 30_000 },
  );
  const [acceptInvite] = useAcceptInviteMutation();
  const [declineInvite] = useDeclineInviteMutation();
  const shownIds = useRef<Set<string>>(new Set());
  const toastIds = useRef<Map<string, string>>(new Map());

  const pending =
    data?.invites?.filter((inv) => inv.status === "pending") ?? [];

  useEffect(() => {
    for (const invite of pending) {
      if (shownIds.current.has(invite.id)) continue;
      shownIds.current.add(invite.id);

      const isVoter = invite.gameType === "voter";
      const message = isVoter
        ? (t("room.invite.banner.voter") as string)
        : (t("room.invite.banner.swipe") as string);

      const id = toast.show(message, {
        type: "info",
        duration: 0,
        onPress: async () => {
          try {
            await acceptInvite({ id: invite.id, joinMethod: "manual" }).unwrap();
            if (invite.gameType === "voter") {
              router.replace({ pathname: "/voter", params: { sessionId: invite.roomId, inviteId: invite.id } });
            } else {
              router.replace({ pathname: "/room/[roomId]", params: { roomId: invite.roomId, inviteId: invite.id } });
            }
          } catch {}
        },
        onDismiss: () => {
          declineInvite(invite.id);
          toastIds.current.delete(invite.id);
          shownIds.current.delete(invite.id);
        },
      });
      toastIds.current.set(invite.id, id);
    }

    for (const [inviteId, toastId] of toastIds.current) {
      if (!pending.some((inv) => inv.id === inviteId)) {
        toast.dismiss(toastId);
        toastIds.current.delete(inviteId);
        shownIds.current.delete(inviteId);
      }
    }
  }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
