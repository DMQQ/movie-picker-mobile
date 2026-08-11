import { useCallback } from "react";
import Icon from "./Icon";
import Text from "./Text";
import { StyleSheet, View } from "react-native";

import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useAppSelector } from "../redux/store";
import { useGetGameMembersQuery } from "../redux/lists/listsApi";
import { getUserAvatarColor } from "../utils/avatar";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

const mutedText = "rgba(255,255,255,0.45)";

const AVATAR_SIZE = 34;
const OVERLAP = 10;

export default function PlayedWith() {
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  const { data, isLoading, refetch } = useGetGameMembersQuery(undefined, { skip: !isFullAccount });

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));
  const members = data?.members ?? [];

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <Icon source="loading" size={14} color={colors.textSecondary} />
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.empty}>No one yet</Text>
      </View>
    );
  }

  const visible = members.slice(0, 6);
  const extra = members.length - visible.length;

  return (
    <View style={styles.card}>
      <View style={styles.stack}>
        {visible.map((m, i) => (
          <View
            key={m.id}
            style={[
              styles.avatar,
              {
                marginLeft: i === 0 ? 0 : -OVERLAP,
                zIndex: visible.length - i,
                backgroundColor: m.avatarUrl ? undefined : getUserAvatarColor(m.name),
              },
            ]}
          >
            {m.avatarUrl ? (
              <Image
                style={styles.avatarImg}
                source={{ uri: m.avatarUrl }}
                cachePolicy="memory-disk"
              />
            ) : (
              <Text style={styles.avatarLetter}>
                {m.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        ))}
        {extra > 0 && (
          <View style={[styles.avatar, styles.extra, { marginLeft: -OVERLAP }]}>
            <Text style={styles.extraText}>+{extra}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.countRow}>
          <Icon source="account-group" size={12} color={colors.textSecondary} />
          <Text style={styles.count}>
            {members.length} {members.length === 1 ? "player" : "players"}
          </Text>
        </View>
        <Text style={styles.names} numberOfLines={1}>
          {members.map((m) => m.name.split(" ")[0]).join(", ")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
  },
  empty: { fontSize: fontSize.sm + 1, color: mutedText },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
  },

  stack: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarLetter: { fontSize: fontSize.sm + 1, fontWeight: fontWeight.bold, color: colors.text },

  extra: { backgroundColor: colors.overlay },
  extraText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: mutedText },

  info: { flex: 1, gap: spacing.xs - 2 },
  countRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 1 },
  count: { fontSize: fontSize.lg - 1, fontWeight: fontWeight.bold, color: colors.text },
  names: { fontSize: fontSize.xs + 1, color: mutedText },
});
