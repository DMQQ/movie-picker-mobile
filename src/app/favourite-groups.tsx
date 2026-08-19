import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fontSize, radius, spacing } from "../constants/design";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { memo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from "react-native";
import TextInput from "../components/TextInput";

import { addToGroup, createGroup, removeFromGroup } from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { posthog } from "../constants/posthog";

interface CreateListHeaderProps {
  onCreated: () => void;
}

const CreateListHeader = memo(function CreateListHeader({ onCreated }: CreateListHeaderProps) {
  const dispatch = useAppDispatch<any>();
  const t = useTranslation();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await dispatch(createGroup(trimmed));
    setName("");
    setCreating(false);
    setSaving(false);
    onCreated();
  };

  const handleCancel = () => {
    setCreating(false);
    setName("");
  };

  if (creating) {
    return (
      <View style={styles.createRow}>
        <TextInput
          style={styles.createInput}
          placeholder={t("favourites.newListPlaceholder")}
          value={name}
          onChangeText={setName}
          autoFocus
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
        <Pressable
          style={[styles.createSaveBtn, !name.trim() && styles.createSaveBtnDisabled]}
          onPress={handleSave}
          disabled={!name.trim() || saving}
        >
          <MaterialCommunityIcons name="check" size={20} color={colors.text} />
        </Pressable>
        <Pressable style={styles.createCancelBtn} onPress={handleCancel}>
          <MaterialCommunityIcons name="close" size={20} color={colors.placeholder} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.newListBtn} onPress={() => setCreating(true)}>
      <MaterialCommunityIcons name="plus" size={20} color={colors.primary} style={styles.itemIcon} />
      <Text style={styles.newListBtnText}>{t("favourites.newList")}</Text>
    </Pressable>
  );
});

export default function FavouriteGroupsScreen() {
  const dispatch = useAppDispatch<any>();
  const t = useTranslation();
  const [query, setQuery] = useState("");

  const { movieId: movieIdParam, movieTitle, movieName, moviePosterPath, movieType } =
    useLocalSearchParams<{
      movieId: string;
      movieTitle?: string;
      movieName?: string;
      moviePosterPath?: string;
      movieType?: string;
    }>();

  const movieId = +movieIdParam;

  const groups = useAppSelector((state) => state.favourite.groups);

  const filtered = query
    ? groups.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
    : groups;

  const onPress = (group: (typeof groups)[number]) => {
    const inGroup = group.movies.some(
      (m) => +m.id === movieId && m.type === movieType,
    );

    if (inGroup) {
      dispatch(removeFromGroup({ groupId: group.id, movieId }));
      posthog?.capture("favourite_removed", {
        content_id: movieId,
        content_type: movieType ?? (movieTitle !== undefined ? "movie" : "tv"),
      });
    } else {
      dispatch(
        addToGroup({
          item: {
            id: movieId,
            imageUrl: moviePosterPath ?? "",
            type:
              (movieType as any) ?? (movieTitle !== undefined ? "movie" : "tv"),
            title: movieTitle || movieName,
          },
          groupId: group.id,
        }),
      );
      posthog?.capture("favourite_added", {
        content_id: movieId,
        content_type: movieType ?? (movieTitle !== undefined ? "movie" : "tv"),
      });
    }

    if (Platform.OS === "ios")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container} collapsable={false}>
      <View style={styles.header} collapsable={false}>
        {Platform.OS === "android" && <View style={styles.grabber} />}
        <Text style={styles.title}>
          {t("quick-actions.modal")}{" "}
          <Text style={styles.movieTitle}>{movieTitle || movieName}</Text>
        </Text>

        <View style={styles.searchRow}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.placeholder}
            style={styles.searchIcon}
          />
          <RNTextInput
            style={styles.searchInput}
            placeholder={t("favourites.searchPlaceholder")}
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={colors.placeholder}
              />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<CreateListHeader onCreated={() => {}} />}
        renderItem={({ item: group }) => {
          const inGroup = group.movies.some((m) => +m.id === movieId && m.type === movieType);
          return (
            <Pressable
              style={[
                styles.item,
                inGroup
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.input },
              ]}
              onPress={() => onPress(group)}
              android_ripple={{ color: colors.border }}
            >
              <MaterialCommunityIcons
                name={inGroup ? "bookmark-check" : "bookmark-outline"}
                size={22}
                color={inGroup ? colors.text : colors.placeholder}
                style={styles.itemIcon}
              />
              <Text style={styles.itemText}>{group.name}</Text>
              {inGroup && (
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color={colors.text}
                />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    ...Platform.select({
      ios: { paddingTop: spacing.xxl + 1 },
    }),
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radius.xs - 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginTop: spacing.md,
    marginBottom: spacing.screen,
  },
  header: {
    flexShrink: 0,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontFamily: "Bebas",
    marginBottom: spacing.lg + 2,
  },
  movieTitle: {
    color: colors.primary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    height: 46,
    borderWidth: 1,
    borderColor: colors.disabled,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md + 1,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  list: {
    gap: spacing.sm + 2,
  },
  listContainer: {
    flex: 1,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  itemIcon: {
    marginRight: spacing.md,
  },
  itemText: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  newListBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    height: 50,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.input,
  },
  newListBtnText: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.placeholder,
  },
  createRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  createInput: {
    flex: 1,
  },
  createSaveBtn: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  createSaveBtnDisabled: {
    opacity: 0.4,
  },
  createCancelBtn: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
});
