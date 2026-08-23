import { Pressable, StyleSheet, View } from "react-native";
import Text from "./Text";
import { colors, fontSize, radius, spacing } from "../constants/design";

interface TicketButtonProps {
  label: string;
  onPress: () => void;
  holeColor?: string;
}

export default function TicketButton({ label, onPress, holeColor = colors.appBackground }: TicketButtonProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <View style={[styles.hole, styles.topLeft, { backgroundColor: holeColor }]} />
        <View style={[styles.hole, styles.topRight, { backgroundColor: holeColor }]} />
        <View style={[styles.hole, styles.bottomLeft, { backgroundColor: holeColor }]} />
        <View style={[styles.hole, styles.bottomRight, { backgroundColor: holeColor }]} />
        <Text style={styles.icon}>🎟️</Text>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F0E1",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm - 2,
    position: "relative",
  },
  pressed: { opacity: 0.95 },
  icon: { fontSize: fontSize.lg },
  label: {
    fontFamily: "Bebas",
    fontSize: fontSize.lg,
    letterSpacing: 1,
    color: colors.input,
  },
  hole: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: radius.sm + 2,
  },
  topLeft: { top: -5, left: -5 },
  topRight: { top: -5, right: -5 },
  bottomLeft: { bottom: -5, left: -5 },
  bottomRight: { bottom: -5, right: -5 },
});
