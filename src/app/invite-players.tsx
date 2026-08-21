import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import FormSheetContainer from "../components/FormSheetContainer";
import SearchField from "../components/SearchField";
import Button from "../components/Button";
import Text from "../components/Text";
import UserAvatar from "../components/UserAvatar";
import { useAppSelector } from "../redux/store";
import {
  useGetGameMembersQuery,
  type GameMember,
} from "../redux/lists/listsApi";
import { useSendInviteMutation } from "../redux/invite/inviteApi";
import {
  colors,
  fontSize,
  fontWeight,
  radius,
  spacing,
} from "../constants/design";
import useTranslation from "../service/useTranslation";
import { posthog } from "../constants/posthog";
import SignUpNudgeBanner from "../components/SignUpNudgeBanner";

interface PlayerRowProps {
  member: GameMember;
  invited: boolean;
  loading: boolean;
  onInvite: (member: GameMember) => void;
}

const PlayerRow = memo(
  ({ member, invited, loading, onInvite }: PlayerRowProps) => {
    const t = useTranslation();

    return (
      <View style={styles.row}>
        <View style={styles.playerInfo}>
          <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size={40} />
          <View style={styles.playerText}>
            <Text style={styles.name} numberOfLines={1}>
              {member.name}
            </Text>
            {!member.canReceiveNotification && (
              <Text style={styles.notifWarning}>
                {t("room.invite.noNotifications") as string}
              </Text>
            )}
          </View>
        </View>

        <Button
          mode={invited ? "contained" : "outlined"}
          compact
          disabled={invited || loading}
          loading={loading}
          icon={invited ? "check" : undefined}
          buttonColor={invited ? "#42DCA3" : undefined}
          style={styles.inviteButton}
          onPress={() => onInvite(member)}
        >
          {loading
            ? (t("room.invite.sending") as string)
            : invited
              ? (t("room.invite.invited") as string)
              : (t("room.invite.invite") as string)}
        </Button>
      </View>
    );
  },
);

const Separator = () => <View style={styles.separator} />;

export default function InvitePlayersScreen() {
  const { roomId, gameType } = useLocalSearchParams<{
    roomId: string;
    gameType: string;
  }>();
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  const { data, isLoading } = useGetGameMembersQuery(undefined, {
    skip: !isFullAccount,
  });
  const t = useTranslation();
  const [sendInvite, { error }] = useSendInviteMutation();
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const invitedIdsRef = useRef(invitedIds);
  invitedIdsRef.current = invitedIds;
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const allMembers = data?.members ?? [];

  const members = useMemo(() => {
    if (!query) return allMembers;
    const q = query.toLowerCase();
    return allMembers.filter((m) => m.name.toLowerCase().includes(q));
  }, [allMembers, query]);

  const handleInvite = useCallback(
    async (member: GameMember) => {
      if (!roomId || invitedIdsRef.current.has(member.id)) return;
      setLoadingId(member.id);
      try {
        await sendInvite({
          receiverId: member.id,
          gameType: gameType ?? "swipe",
          roomId: roomId,
        }).unwrap();
        setInvitedIds((prev) => new Set(prev).add(member.id));
        posthog?.capture("room_invite_sent", {
          game_type: gameType ?? "swipe",
        });
      } catch {}
      setLoadingId(null);
    },
    [roomId, gameType, sendInvite],
  );

  return (
    <FormSheetContainer title={t("room.inviteFriends") as string}>
      {!isFullAccount ? (
        <SignUpNudgeBanner />
      ) : (
        <>
          <View style={styles.searchWrapper}>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={t("room.invite.searchPlaceholder") as string}
            />
          </View>

          <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        style={styles.listContainer}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading
                ? (t("room.builder.loading") as string)
                : query
                  ? (t("room.invite.noPlayersFound") as string)
                  : (t("room.invite.noRecentPlayers") as string)}
            </Text>
          </View>
        }
          renderItem={({ item }) => (
            <PlayerRow
              member={item}
              invited={invitedIds.has(item.id)}
              loading={loadingId === item.id}
              onInvite={handleInvite}
            />
          )}
        />
        </>
      )}
    </FormSheetContainer>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listContainer: {
    flex: 1,
    overflow: "hidden",
  },
  list: {
    paddingHorizontal: 0,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  playerText: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  notifWarning: {
    fontSize: fontSize.xs,
    color: "#ff6b6b",
    marginTop: 2,
  },
  inviteButton: {
    borderRadius: radius.pill,
    minWidth: 100,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  empty: {
    paddingTop: spacing.xxl * 2,
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.placeholder,
  },
});
