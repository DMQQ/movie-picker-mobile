import { View, StyleSheet } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const BENEFITS = [
  { icon: "cloud-upload", text: "Cloud backup of your saved movie lists" },
  { icon: "controller-classic", text: "Full game history & session stats" },
  { icon: "account-group", text: "Friends list — one tap to start a game together" },
  { icon: "star-shooting", text: "Personalized movie recommendations" },
  { icon: "emoticon", text: "Custom nickname & avatar" },
];

function BenefitRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIconWrap}>
        <Icon source={icon} size={16} color="#BB86FC" />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

export default function UnauthAccount({ expired }: { expired: boolean }) {
  return (
    <View style={styles.wrap}>
      {expired && (
        <View style={styles.expiredBanner}>
          <Icon source="alert-circle-outline" size={18} color="#CF6679" />
          <Text style={styles.expiredText}>
            Your session expired — please sign in again.
          </Text>
        </View>
      )}

      <LinearGradient
        colors={["rgba(187,134,252,0.08)", "rgba(187,134,252,0.03)"]}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Icon source="filmstrip" size={22} color="#BB86FC" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Unlock the full experience</Text>
            <Text style={styles.subtitle}>Sign in to get access to exclusive features</Text>
          </View>
        </View>

        <View style={styles.benefitList}>
          {BENEFITS.map((b) => (
            <BenefitRow key={b.icon} icon={b.icon} text={b.text} />
          ))}
        </View>

        <Button
          mode="contained"
          onPress={() => router.push("/auth/login")}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          Sign in
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push("/auth/register")}
          style={[styles.btn, { marginTop: 8 }]}
          contentStyle={styles.btnContent}
        >
          Create account
        </Button>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(207,102,121,0.1)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  expiredText: { flex: 1, color: "#CF6679", fontSize: 13 },
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(187,134,252,0.15)",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(187,134,252,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 },
  benefitList: { gap: 10, marginBottom: 20 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(187,134,252,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: { flex: 1, fontSize: 13, color: "rgba(255,255,255,0.75)" },
  btn: { borderRadius: 25 },
  btnContent: { paddingVertical: 4 },
});
