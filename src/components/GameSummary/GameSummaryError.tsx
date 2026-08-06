import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import PrimaryButton from "../PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useTranslation from "../../service/useTranslation";

interface Props {
  error: string;
  onBack: () => void;
}

export default function GameSummaryError({ error, onBack }: Props) {
  const t = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="wifi-alert" size={36} color="#FF6B6B" />
      </View>
      <Text style={styles.heading}>{t("game-summary.error")}</Text>
      <Text style={styles.subtext}>{error}</Text>
      <PrimaryButton onPress={onBack} style={styles.btn}>
        {t("game-summary.back-to-home")}
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 32,
    marginHorizontal: 16,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,107,107,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize: 36,
    fontFamily: "Bebas",
    color: "#FFFFFF",
    letterSpacing: 1,
    textAlign: "center",
  },
  subtext: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  btn: { borderRadius: 100 },
  btnContent: { paddingVertical: 7.5 },
});
