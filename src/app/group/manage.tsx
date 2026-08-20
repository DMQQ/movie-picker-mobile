import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import FormSheetContainer from "../../components/FormSheetContainer";
import TextInput from "../../components/TextInput";
import Icon from "../../components/Icon";
import Divider from "../../components/Divider";
import Text from "../../components/Text";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";
import { useAppDispatch } from "../../redux/store";
import { renameGroup, deleteGroup } from "../../redux/favourites/favourites";
import { useGetListQuery } from "../../redux/lists/listsApi";
import useTranslation from "../../service/useTranslation";

export default function ManageGroup() {
  const params = useLocalSearchParams<{ id: string; name: string; listType?: string }>();
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const [name, setName] = useState(params.name ?? "");
  const [saving, setSaving] = useState(false);

  const { data: listData } = useGetListQuery(params.listType ?? "", { skip: !params.listType });

  const openShare = () => {
    const movies = (listData?.items ?? []).map((item) => ({
      id: item.contentId,
      imageUrl: item.content?.poster_path ?? "",
      type: item.contentType,
    }));
    router.push({ pathname: "/share-selection", params: { movies: JSON.stringify(movies) } } as any);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === params.name) { router.back(); return; }
    setSaving(true);
    try {
      await dispatch(renameGroup({ groupId: params.id, name: trimmed })).unwrap();
      router.back();
    } catch {
      Alert.alert(t("common.error") as string, t("manage-group.renameError") as string);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
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
              router.navigate("/(tabs)/favourites");
            } catch {}
          },
        },
      ]
    );
  };

  return (
    <FormSheetContainer title={t("manage-group.title") as string} keyboard>
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

      <Divider style={styles.divider} />

      {listData && listData.items.length > 0 && (
        <Pressable style={styles.shareButton} onPress={openShare}>
          <Icon source="share-outline" size={18} color={colors.text} />
          <Text style={styles.shareButtonText}>{t("manage-group.share") as string}</Text>
        </Pressable>
      )}

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>{t("manage-group.delete") as string}</Text>
      </Pressable>
    </FormSheetContainer>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  nameInput: { flex: 1 },
  saveButton: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: { opacity: 0.5 },
  divider: { marginVertical: spacing.sm },
  shareButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  shareButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
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
