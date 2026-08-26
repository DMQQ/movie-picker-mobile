import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "./Text";
import { colors, fontWeight, fontSize, radius, spacing} from "../constants/design";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import Button from "./Button";
import PrimaryButton from "./PrimaryButton";
import useTranslation from "../service/useTranslation";

type Props = {
  visible: boolean;
  counts: { movies: number; interactions: number };
  isMigrating: boolean;
  onSync: () => void;
  onDismiss: () => void;
};

export default function MigrationModal({ visible, counts, isMigrating, onSync, onDismiss }: Props) {
  const t = useTranslation();
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
            color={colors.primary}
            style={{ marginBottom: spacing.md }}
          />
          <Text style={styles.title}>{t("migration.modal-title")}</Text>
          <Text style={styles.body}>
            {t("migration.bodyStart")}
            {counts.movies > 0 && (
              <Text style={styles.highlight}>
                {t(counts.movies === 1 ? "migration.movies-one" : "migration.movies-many", { count: counts.movies })}
              </Text>
            )}
            {counts.movies > 0 && counts.interactions > 0 && t("migration.bodyAnd")}
            {counts.interactions > 0 && (
              <Text style={styles.highlight}>
                {t(counts.interactions === 1 ? "migration.interactions-one" : "migration.interactions-many", { count: counts.interactions })}
              </Text>
            )}
            {t("migration.bodyEnd")}
          </Text>
          <PrimaryButton
            onPress={onSync}
            loading={isMigrating}
            disabled={isMigrating}
            style={styles.syncBtn}
          >
            {t("migration.syncNow")}
          </PrimaryButton>
          <Button
            mode="text"
            onPress={onDismiss}
            disabled={isMigrating}
            textColor="rgba(255,255,255,0.45)"
          >
            {t("migration.later")}
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
    padding: spacing.xxl,
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: radius.modal,
    padding: spacing.xxl + 4,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.overlay,
  },
  title: {
    fontSize: 22,
    fontFamily: "Bebas",
    color: colors.text,
    letterSpacing: 0.8,
    marginBottom: spacing.sm + 2,
  },
  body: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  highlight: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  syncBtn: {
    borderRadius: radius.lg + 1,
    width: "100%",
    marginBottom: spacing.xs + 2,
  },
});
