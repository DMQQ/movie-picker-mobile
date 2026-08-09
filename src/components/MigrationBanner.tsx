import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "./Text";
import {
  colors,
  fontWeight,
  fontSize,
  radius,
  spacing,
  withAlpha,
} from "../constants/design";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import Button from "./Button";

type Props = {
  counts: { movies: number; interactions: number };
  isMigrating: boolean;
  onSync: () => void;
  onDismiss: () => void;
};

export default function MigrationBanner({ counts, isMigrating, onSync, onDismiss }: Props) {
  const movieLabel =
    counts.movies > 0
      ? `${counts.movies} saved movie${counts.movies !== 1 ? "s" : ""}`
      : "";
  const interactionLabel =
    counts.interactions > 0
      ? `${counts.interactions} interaction${counts.interactions !== 1 ? "s" : ""}`
      : "";
  const sub = [movieLabel, interactionLabel].filter(Boolean).join(" · ");

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons
        name="cloud-upload-outline"
        size={20}
        color={colors.primary}
        style={{ marginTop: spacing.xs - 3 }}
      />
      <View style={styles.text}>
        <Text style={styles.title}>Sync to cloud</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <Button
        mode="text"
        compact
        onPress={onSync}
        icon={isMigrating ? ({ color }) => <ActivityIndicator size={16} color={color} /> : undefined}
        disabled={isMigrating}
        textColor={colors.primary}
        style={{ marginRight: -4 }}
      >
        Sync
      </Button>
      <Pressable onPress={onDismiss} hitSlop={10} style={{ padding: spacing.xs }}>
        <MaterialCommunityIcons name="close" size={16} color="rgba(255,255,255,0.4)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    backgroundColor: withAlpha(colors.primary, 0.08),
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: radius.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    marginBottom: spacing.md + 2,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md - 1,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  sub: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.5)",
    marginTop: spacing.xs - 3,
  },
});
