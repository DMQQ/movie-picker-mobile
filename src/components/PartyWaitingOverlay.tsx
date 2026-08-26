import { StyleSheet, View } from "react-native";
import Text from "./Text";
import { FancySpinner } from "./FancySpinner";
import { colors, fontSize, radius, spacing } from "../constants/design";
import useTranslation from "../service/useTranslation";

const COPY_KEYS = {
  waiting: {
    title: "party-waiting.host-setting-up",
    subtitle: "party-waiting.host-subtitle",
  },
  starting: {
    title: "party-waiting.starting",
    subtitle: "party-waiting.preparing",
  },
} as const;

interface PartyWaitingOverlayProps {
  visible: boolean;
  state?: keyof typeof COPY_KEYS;
}

export default function PartyWaitingOverlay({ visible, state = "waiting" }: PartyWaitingOverlayProps) {
  const t = useTranslation();
  if (!visible) return null;
  const copy = COPY_KEYS[state];
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <FancySpinner size={56} />
        <Text style={styles.title}>{t(copy.title)}</Text>
        <Text style={styles.subtitle}>{t(copy.subtitle)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.appBackground + "EE",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    maxWidth: 300,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: fontSize.xl,
    letterSpacing: 0.5,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    textAlign: "center",
  },
});
