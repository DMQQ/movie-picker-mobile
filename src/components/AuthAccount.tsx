import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Icon from "./Icon";
import Text from "./Text";

import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import type { AuthUser } from "../redux/auth/authSlice";
import { useGetGamesQuery } from "../redux/lists/listsApi";
import AccountProfileHeader from "./AccountProfileHeader";
import RecentGames from "./RecentGames";
import RecentRatings from "./RecentRatings";
import PlayedWith from "./PlayedWith";
import { useGetMyRatingsQuery } from "../redux/ratings/ratingsApi";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";
import useTranslation from "../service/useTranslation";

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
  const t = useTranslation();
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
          <Text style={styles.seeAllText}>{t("common.seeAll")}</Text>
          <Icon source="chevron-right" size={13} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

export default function AuthAccount({ user }: Props) {
  const { data, refetch, error } = useGetGamesQuery();
  const { data: ratingsData } = useGetMyRatingsQuery({ limit: 1 });
  const t = useTranslation();

  useEffect(() => {
    if (error) console.error("[AuthAccount] getGames error:", JSON.stringify(error));
  }, [error]);

  const gameCount = data?.games.length ?? 0;
  const ratingsCount = ratingsData?.total ?? 0;

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  return (
    <View style={styles.wrap}>
      <AccountProfileHeader user={user} />

      <View style={styles.divider} />

      <View style={styles.section}>
        <SectionHeader
          icon="history"
          title={t("account.recentGames") as string}
          badge={gameCount > 0 ? gameCount : undefined}
          onSeeAll={
            gameCount > 0 ? () => router.push("/games" as any) : undefined
          }
        />
        <RecentGames />
      </View>

      <View style={styles.section}>
        <SectionHeader
          icon="star-outline"
          title={t("ratings.myRatings") as string}
          badge={ratingsCount > 0 ? ratingsCount : undefined}
          onSeeAll={
            ratingsCount > 0 ? () => router.push("/ratings" as any) : undefined
          }
        />
        <RecentRatings />
      </View>

      <View style={styles.section}>
        <SectionHeader icon="account-group" title={t("account.playedWith") as string} />
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
    paddingVertical: spacing.xs - 3,
  },
  badgeText: {
    fontSize: fontSize.xs + 1,
    fontWeight: fontWeight.semibold,
    color: colors.placeholder,
  },

  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs - 2 },
  seeAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
