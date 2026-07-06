import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import type { AuthUser } from "../redux/auth/authSlice";
import AccountProfileHeader from "./AccountProfileHeader";
import RecentGames from "./RecentGames";
import PlayedWith from "./PlayedWith";

interface Props {
  user: AuthUser;
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon source={icon} size={16} color="rgba(255,255,255,0.5)" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function AuthAccount({ user }: Props) {
  return (
    <View style={styles.wrap}>
      <AccountProfileHeader user={user} />

      <Section icon="history" title="Recent Games">
        <RecentGames />
      </Section>

      <Section icon="account-group" title="Played With">
        <PlayedWith />
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 0 },

  section: { width: "100%", gap: 10, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
