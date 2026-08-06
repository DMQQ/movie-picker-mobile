import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontWeight } from "../constants/design";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import PrimaryButton from "./PrimaryButton";

type Props = {
  visible: boolean;
  counts: { movies: number; interactions: number };
  isMigrating: boolean;
  onSync: () => void;
  onDismiss: () => void;
};

export default function MigrationModal({ visible, counts, isMigrating, onSync, onDismiss }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="cloud-upload-outline"
            size={36}
            color="#BB86FC"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.title}>Sync your collection</Text>
          <Text style={styles.body}>
            {"You have "}
            {counts.movies > 0 && (
              <Text style={styles.highlight}>
                {counts.movies} saved movie{counts.movies !== 1 ? "s" : ""}
              </Text>
            )}
            {counts.movies > 0 && counts.interactions > 0 && " and "}
            {counts.interactions > 0 && (
              <Text style={styles.highlight}>
                {counts.interactions} interaction{counts.interactions !== 1 ? "s" : ""}
              </Text>
            )}
            {" stored locally. Upload them to your account so they're available everywhere."}
          </Text>
          <PrimaryButton
            onPress={onSync}
            loading={isMigrating}
            disabled={isMigrating}
            style={styles.syncBtn}
          >
            Sync now
          </PrimaryButton>
          <Button
            mode="text"
            onPress={onDismiss}
            disabled={isMigrating}
            textColor="rgba(255,255,255,0.45)"
          >
            Later
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: 22,
    fontFamily: "Bebas",
    color: "#fff",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  highlight: {
    color: "#BB86FC",
    fontWeight: fontWeight.semibold,
  },
  syncBtn: {
    borderRadius: 25,
    width: "100%",
    marginBottom: 6,
  },
});
