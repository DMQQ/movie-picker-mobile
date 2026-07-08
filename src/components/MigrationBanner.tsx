import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

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
        color="#BB86FC"
        style={{ marginTop: 1 }}
      />
      <View style={styles.text}>
        <Text style={styles.title}>Sync to cloud</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <Button
        mode="text"
        compact
        onPress={onSync}
        loading={isMigrating}
        disabled={isMigrating}
        textColor="#BB86FC"
        style={{ marginRight: -4 }}
      >
        Sync
      </Button>
      <Pressable onPress={onDismiss} hitSlop={10} style={{ padding: 4 }}>
        <MaterialCommunityIcons name="close" size={16} color="rgba(255,255,255,0.4)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(187, 134, 252, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: "#BB86FC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 4,
    marginBottom: 14,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#BB86FC",
  },
  sub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 1,
  },
});
