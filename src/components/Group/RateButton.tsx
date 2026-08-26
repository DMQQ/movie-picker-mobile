import { Pressable, StyleSheet, View } from "react-native";
import Text from "../Text";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontSize, radius, spacing } from "../../constants/design";
import useTranslation from "../../service/useTranslation";

interface RateButtonProps {
  rating?: number | null;
  onPress: () => void;
}

export default function RateButton({ rating, onPress }: RateButtonProps) {
  const t = useTranslation();
  const isRated = rating != null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <MaterialCommunityIcons
        name={isRated ? "star" : "star-outline"}
        size={13}
        color={isRated ? "#FFD700" : "#aaa"}
      />
      <Text style={[styles.label, isRated && styles.labelRated]}>
        {isRated ? String(rating) : t("common.rate")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: radius.xs + 2,
    paddingVertical: spacing.xs + 1,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: fontSize.sm - 1,
    color: "#aaa",
    fontFamily: "Bebas",
    letterSpacing: 0.3,
  },
  labelRated: {
    color: "#FFD700",
  },
});
