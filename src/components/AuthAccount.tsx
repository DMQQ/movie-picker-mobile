import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { router } from "expo-router";
import type { AuthUser } from "../redux/auth/authSlice";
import { useGetGamesQuery } from "../redux/lists/listsApi";
import AccountProfileHeader from "./AccountProfileHeader";
import RecentGames from "./RecentGames";
import PlayedWith from "./PlayedWith";

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
        <Icon source={icon} size={14} color="rgba(255,255,255,0.4)" />
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
          <Icon source="chevron-right" size={13} color="rgba(187,134,252,0.7)" />
        </Pressable>
      )}
    </View>
  );
}

export default function AuthAccount({ user }: Props) {
  const { data } = useGetGamesQuery();
  const gameCount = data?.games.length ?? 0;

  return (
    <View style={styles.wrap}>
      <AccountProfileHeader user={user} />

      <View style={styles.divider} />

      <View style={styles.section}>
        <SectionHeader
          icon="history"
          title="Recent Games"
          badge={gameCount > 0 ? gameCount : undefined}
          onSeeAll={gameCount > 0 ? () => router.push("/games" as any) : undefined}
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
  wrap: { width: "100%", gap: 0 },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 20,
    marginTop: 4,
  },

  section: { width: "100%", gap: 12, marginBottom: 24 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.4)" },

  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 12, color: "rgba(187,134,252,0.7)", fontWeight: "500" },
});
