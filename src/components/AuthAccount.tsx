import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import type { AuthUser } from "../redux/auth/authSlice";
import { useGetGamesQuery } from "../redux/lists/listsApi";
import AccountProfileHeader from "./AccountProfileHeader";
import RecentGames from "./RecentGames";
import PlayedWith from "./PlayedWith";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

interface Props {
  user: AuthUser;
}

interface SectionHeaderProps {
  icon: string;
  title: string;
  badge?: string | number;
  onSeeAll?: () => void;
}

function SectionHeader({ icon, title, badge, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <Icon source={icon} size={14} color={colors.placeholder} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.seeAllBtn} hitSlop={10}>
          <Text style={styles.seeAllText}>See all</Text>
          <Icon source="chevron-right" size={13} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

export default function AuthAccount({ user }: Props) {
  const { data, refetch } = useGetGamesQuery();
  const gameCount = data?.games.length ?? 0;

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  return (
    <View style={styles.wrap}>
      <AccountProfileHeader user={user} />

      <View style={styles.divider} />

      <View style={styles.section}>
        <SectionHeader
          icon="history"
          title="Recent Games"
          badge={gameCount > 0 ? gameCount : undefined}
          onSeeAll={
            gameCount > 0 ? () => router.push("/games" as any) : undefined
          }
        />
        <RecentGames />
      </View>

      <View style={styles.section}>
        <SectionHeader icon="account-group" title="Played With" />
        <PlayedWith />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", gap: 0, marginTop: spacing.xxl + 6 },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },

  section: { width: "100%", gap: spacing.md, marginBottom: spacing.xxl },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLeft: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 3 },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.placeholder,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: colors.overlay,
    borderRadius: radius.sm + 2,
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: fontSize.xs + 1,
    fontWeight: fontWeight.semibold,
    color: colors.placeholder,
  },

  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
