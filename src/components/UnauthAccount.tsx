import { View, StyleSheet } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
import PrimaryButton from "./PrimaryButton";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import useTranslation from "../service/useTranslation";

const BENEFIT_ICONS = [
  "cloud-upload",
  "controller-classic",
  "account-group",
  "star-shooting",
] as const;

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
  const t = useTranslation();

  const benefits = [
    { icon: BENEFIT_ICONS[0], text: t("settings.unauth.benefit-cloud") },
    { icon: BENEFIT_ICONS[1], text: t("settings.unauth.benefit-history") },
    { icon: BENEFIT_ICONS[2], text: t("settings.unauth.benefit-friends") },
    { icon: BENEFIT_ICONS[3], text: t("settings.unauth.benefit-recommendations") },
  ];

  return (
    <View style={styles.wrap}>
      {expired && (
        <View style={styles.expiredBanner}>
          <Icon source="alert-circle-outline" size={18} color="#CF6679" />
          <Text style={styles.expiredText}>
            {t("settings.unauth.session-expired")}
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
            <Text style={styles.title}>{t("settings.unauth.title")}</Text>
            <Text style={styles.subtitle}>{t("settings.unauth.subtitle")}</Text>
          </View>
        </View>

        <View style={styles.benefitList}>
          {benefits.map((b) => (
            <BenefitRow key={b.icon} icon={b.icon} text={b.text} />
          ))}
        </View>

        <PrimaryButton onPress={() => router.push("/auth/login")} style={styles.btn}>
          {t("settings.unauth.sign-in")}
        </PrimaryButton>
        <Button
          mode="outlined"
          onPress={() => router.push("/auth/register")}
          style={[styles.btn, { marginTop: 8 }]}
          contentStyle={styles.btnContent}
        >
          {t("settings.unauth.create-account")}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
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
