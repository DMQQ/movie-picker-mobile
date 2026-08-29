import { useCallback } from "react";
import Icon from "./Icon";
import Text from "./Text";
import UserAvatar from "./UserAvatar";
import { StyleSheet, View } from "react-native";

import { useFocusEffect } from "expo-router";
import { useAppSelector } from "../redux/store";
import { useGetGameMembersQuery } from "../redux/lists/listsApi";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";
import useTranslation from "../service/useTranslation";

const mutedText = "rgba(255,255,255,0.45)";

const AVATAR_SIZE = 34;
const OVERLAP = 10;

export default function PlayedWith() {
  const t = useTranslation();
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
      <View style={styles.emptyCard}>
        <View style={styles.ghostRow}>
          {[1, 0.55, 0.25].map((opacity, i) => (
            <View
              key={i}
              style={[styles.ghostAvatar, { marginLeft: i === 0 ? 0 : -OVERLAP, opacity }]}
            />
          ))}
        </View>
        <View style={styles.emptyText}>
          <Text style={styles.emptyTitle}>{t("games.no-one-yet")}</Text>
          <Text style={styles.emptySub}>{t("games.play-with-friends")}</Text>
        </View>
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
              styles.avatarWrapper,
              {
                marginLeft: i === 0 ? 0 : -OVERLAP,
                zIndex: visible.length - i,
              },
            ]}
          >
            <UserAvatar
              name={m.name}
              avatarUrl={m.avatarUrl}
              size={AVATAR_SIZE}
              borderWidth={2}
              borderColor={colors.background}
            />
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
            {t(members.length === 1 ? "common.player-one" : "common.player-many", { count: members.length })}
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

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  ghostRow: { flexDirection: "row", alignItems: "center" },
  ghostAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.background,
  },
  emptyText: { flex: 1, gap: spacing.xs - 2 },
  emptyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  emptySub: { fontSize: fontSize.sm, color: mutedText },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
  },

  stack: { flexDirection: "row", alignItems: "center" },

  avatarWrapper: { alignItems: "center", justifyContent: "center" },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  extra: { backgroundColor: colors.overlay },
  extraText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: mutedText },

  info: { flex: 1, gap: spacing.xs - 2 },
  countRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 1 },
  count: { fontSize: fontSize.lg - 1, fontWeight: fontWeight.bold, color: colors.text },
  names: { fontSize: fontSize.xs + 1, color: mutedText },
});
