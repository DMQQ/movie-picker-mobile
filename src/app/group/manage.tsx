import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Text from "../../components/Text";
import TextInput from "../../components/TextInput";
import Icon from "../../components/Icon";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";
import { useAppDispatch } from "../../redux/store";
import { renameGroup, deleteGroup } from "../../redux/favourites/favourites";
import useTranslation from "../../service/useTranslation";

export default function ManageGroup() {
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(params.name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    console.log("[ManageGroup] save pressed", { id: params.id, trimmed, original: params.name });
    if (!trimmed || trimmed === params.name) {
      router.back();
      return;
    }
    setSaving(true);
    try {
      await dispatch(renameGroup({ groupId: params.id, name: trimmed })).unwrap();
      console.log("[ManageGroup] rename succeeded");
      router.back();
    } catch (err) {
      console.error("[ManageGroup] rename failed:", JSON.stringify(err));
      Alert.alert(t("common.error") as string, t("manage-group.renameError") as string);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    console.log("[ManageGroup] delete pressed", { id: params.id });
    Alert.alert(
      t("manage-group.deleteTitle") as string,
      t("manage-group.deleteMessage") as string,
      [
        { text: t("common.cancel") as string, style: "cancel" },
        {
          text: t("manage-group.delete") as string,
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteGroup(params.id)).unwrap();
              console.log("[ManageGroup] delete succeeded");
              router.navigate("/(tabs)/favourites");
            } catch (err) {
              console.error("[ManageGroup] delete failed:", JSON.stringify(err));
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}
    >
      <View style={styles.handle} />

      <View style={styles.header}>
        <Text style={styles.title}>{t("manage-group.title") as string}</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon source="close" size={20} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <TextInput
            label={t("manage-group.nameLabel") as string}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            style={styles.nameInput}
          />
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Icon source="check" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>{t("manage-group.delete") as string}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginTop: spacing.sm + 2,
    marginBottom: spacing.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  body: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
  },
  saveButton: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  deleteButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.error,
  },
});
