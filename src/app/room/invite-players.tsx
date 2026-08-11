import { useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, TextInput, View } from "react-native";
import { Image } from "expo-image";
import Button from "../../components/Button";
import Text from "../../components/Text";
import { useAppSelector } from "../../redux/store";
import { useGetGameMembersQuery, type GameMember } from "../../redux/lists/listsApi";
import { useSendInviteMutation } from "../../redux/invite/inviteApi";
import { getUserAvatarColor } from "../../utils/avatar";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";
import useTranslation from "../../service/useTranslation";

interface PlayerRowProps {
  member: GameMember;
  invited: boolean;
  loading: boolean;
  onInvite: (member: GameMember) => void;
}

const PlayerRow = memo(({ member, invited, loading, onInvite }: PlayerRowProps) => {
  const t = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.playerInfo}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: member.avatarUrl
                ? undefined
                : getUserAvatarColor(member.name),
            },
          ]}
        >
          {member.avatarUrl ? (
            <Image
              style={styles.avatarImg}
              source={{ uri: member.avatarUrl }}
              cachePolicy="memory-disk"
            />
          ) : (
            <Text style={styles.avatarLetter}>
              {member.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
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
});

const Separator = () => <View style={styles.separator} />;

export default function InvitePlayersScreen() {
  const { roomId, gameType } = useLocalSearchParams<{ roomId: string; gameType: string }>();
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  const { data, isLoading } = useGetGameMembersQuery(undefined, { skip: !isFullAccount });
  const t = useTranslation();
  const [sendInvite] = useSendInviteMutation();
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

  const handleInvite = useCallback(async (member: GameMember) => {
    if (!roomId || invitedIdsRef.current.has(member.id)) return;
    setLoadingId(member.id);
    try {
      await sendInvite({
        receiverId: member.id,
        gameType: gameType ?? "swipe",
        roomId: roomId,
      }).unwrap();
      setInvitedIds((prev) => new Set(prev).add(member.id));
    } catch {}
    setLoadingId(null);
  }, [roomId, gameType, sendInvite]);

  return (
    <View style={styles.container} collapsable={false}>
      {Platform.OS === "android" && <View style={styles.grabber} />}
      <View style={styles.searchContainer} collapsable={false}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("room.invite.searchPlaceholder") as string}
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: { paddingTop: spacing.xxl + 1 },
    }),
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radius.xs - 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.screen,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.input,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  listContainer: {
    flex: 1,
    overflow: "hidden",
  },
  list: {
    paddingHorizontal: spacing.lg,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 40,
    height: 40,
  },
  avatarLetter: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
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
