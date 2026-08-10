import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Image } from "expo-image";
import Text from "../../components/Text";
import { useGetGameMembersQuery, type GameMember } from "../../redux/lists/listsApi";
import { useSendInviteMutation } from "../../redux/invite/inviteApi";
import { getUserAvatarColor } from "../../utils/avatar";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";

export default function InvitePlayersScreen() {
  const { roomId, gameType } = useLocalSearchParams<{ roomId: string; gameType: string }>();
  const { data, isLoading } = useGetGameMembersQuery();
  const [sendInvite] = useSendInviteMutation();
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const allMembers = data?.members ?? [];

  const members = useMemo(() => {
    if (!query) return allMembers;
    const q = query.toLowerCase();
    return allMembers.filter((m) => m.name.toLowerCase().includes(q));
  }, [allMembers, query]);

  const handleInvite = async (member: GameMember) => {
    if (!roomId || invitedIds.has(member.id)) return;
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
        />
      </View>

      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading ? "Loading..." : query ? "No players found" : "No recent players"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const invited = invitedIds.has(item.id);
          const loading = loadingId === item.id;

          return (
            <View style={styles.row}>
              <View style={styles.playerInfo}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: item.avatarUrl
                        ? undefined
                        : getUserAvatarColor(item.name),
                    },
                  ]}
                >
                  {item.avatarUrl ? (
                    <Image
                      style={styles.avatarImg}
                      source={{ uri: item.avatarUrl }}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <Text style={styles.avatarLetter}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.inviteButton,
                  invited && styles.inviteButtonSent,
                ]}
                disabled={invited || loading}
                onPress={() => handleInvite(item)}
              >
                <Text
                  style={[
                    styles.inviteButtonText,
                    invited && styles.inviteButtonTextSent,
                  ]}
                >
                  {loading ? "Sending..." : invited ? "Invited" : "Invite"}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
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
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flex: 1,
  },
  inviteButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 90,
    alignItems: "center",
  },
  inviteButtonSent: {
    backgroundColor: colors.primary,
  },
  inviteButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  inviteButtonTextSent: {
    color: colors.text,
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
