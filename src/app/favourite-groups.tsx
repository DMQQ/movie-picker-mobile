import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fontSize, radius, spacing } from "../constants/design";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { memo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FormSheetContainer from "../components/FormSheetContainer";
import TextInput from "../components/TextInput";
import SearchField from "../components/SearchField";

import {
  addManyToGroup,
  addToGroup,
  clearPendingBulkMovies,
  createGroup,
  removeFromGroup,
} from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { posthog } from "../constants/posthog";
import { addToast } from "../redux/toast/toastSlice";
import SignUpNudgeBanner from "../components/SignUpNudgeBanner";
import Divider from "../components/Divider";
import { useBlockedMovies } from "../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../hooks/useSuperLikedMovies";

interface CreateListHeaderProps {
  onCreated: (groupId: string) => void;
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
    const result = await dispatch(createGroup(trimmed));
    setName("");
    setCreating(false);
    setSaving(false);
    onCreated(result.payload?.id ?? "");
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

  const pendingBulkMovies = useAppSelector((state) => state.favourite.pendingBulkMovies);
  const isBulkMode = !!pendingBulkMovies;

  const movieId = isBulkMode ? 0 : +movieIdParam;
  const movieContentType = (movieType as "movie" | "tv") ?? "movie";

  const groups = useAppSelector((state) => state.favourite.groups);

  const { blockMovie, unblockMovie, isBlocked } = useBlockedMovies();
  const { superLikeMovie, removeSuperLike, isSuperLiked } = useSuperLikedMovies();

  const movie = !isBulkMode ? {
    id: movieId,
    title: movieTitle || movieName || "",
    poster_path: moviePosterPath ?? null,
    type: movieContentType,
  } : null;

  const filtered = query
    ? groups.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
    : groups;

  const q = query.toLowerCase();
  const showSuperLiked = !isBulkMode && movie && (!q || (t("super-liked.title") as string).toLowerCase().includes(q));
  const showBlocked = !isBulkMode && movie && (!q || (t("blocked.title") as string).toLowerCase().includes(q));
  const showSystemSection = showSuperLiked || showBlocked;

  const handleBulkAdd = async (groupId: string) => {
    if (!pendingBulkMovies) return;
    const group = groups.find((g) => g.id === groupId);
    await dispatch(addManyToGroup({ groupId, movies: pendingBulkMovies }));
    dispatch(clearPendingBulkMovies());
    dispatch(addToast({
      id: Date.now().toString(),
      message: t("favourites.savedToList", { name: group?.name ?? "" }),
      type: "success",
      duration: 3000,
    }));
    if (Platform.OS === "ios") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const onPress = (group: (typeof groups)[number]) => {
    if (isBulkMode) {
      handleBulkAdd(group.id);
      return;
    }

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

  const title = isBulkMode
    ? t("favourites.saveTo")
    : `${t("quick-actions.modal")} ${movieTitle || movieName}`;

  return (
    <FormSheetContainer title={title as string}>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder={t("favourites.searchPlaceholder") as string}
        style={styles.searchRow}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <CreateListHeader
              onCreated={(groupId) => {
                if (isBulkMode && groupId) handleBulkAdd(groupId);
              }}
            />
            {showSystemSection && (
              <View style={styles.systemListGroup}>
                {showSuperLiked && (
                  <Pressable
                    style={[styles.item, { backgroundColor: isSuperLiked(movieId, movieContentType) ? "#3A3200" : colors.input }]}
                    onPress={() =>
                      isSuperLiked(movieId, movieContentType)
                        ? removeSuperLike(movieId, movieContentType)
                        : superLikeMovie(movie as any)
                    }
                    android_ripple={{ color: colors.border }}
                  >
                    <MaterialCommunityIcons name="star-circle" size={22} color="#FFD700" style={styles.itemIcon} />
                    <Text style={styles.itemText}>{t("super-liked.title")}</Text>
                    {isSuperLiked(movieId, movieContentType) && (
                      <MaterialCommunityIcons name="check" size={18} color="#FFD700" />
                    )}
                  </Pressable>
                )}
                {showBlocked && (
                  <Pressable
                    style={[styles.item, { backgroundColor: isBlocked(movieId, movieContentType) ? "#3A0010" : colors.input }]}
                    onPress={() =>
                      isBlocked(movieId, movieContentType)
                        ? unblockMovie(movieId, movieContentType)
                        : blockMovie(movie as any)
                    }
                    android_ripple={{ color: colors.border }}
                  >
                    <MaterialCommunityIcons name="cancel" size={22} color="#FF4458" style={styles.itemIcon} />
                    <Text style={styles.itemText}>{t("blocked.title")}</Text>
                    {isBlocked(movieId, movieContentType) && (
                      <MaterialCommunityIcons name="check" size={18} color="#FF4458" />
                    )}
                  </Pressable>
                )}
                <Divider style={styles.divider} />
              </View>
            )}
          </>
        }
        renderItem={({ item: group }) => {
          const inGroup = !isBulkMode && group.movies.some((m) => +m.id === movieId && m.type === movieType);
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
                name={isBulkMode ? "folder-plus-outline" : inGroup ? "bookmark-check" : "bookmark-outline"}
                size={22}
                color={inGroup ? colors.text : colors.placeholder}
                style={styles.itemIcon}
              />
              <Text style={styles.itemText}>{group.name}</Text>
              {!isBulkMode && inGroup && (
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color={colors.text}
                />
              )}
            </Pressable>
          );
        }}
        ListFooterComponent={<SignUpNudgeBanner />}
      />
    </FormSheetContainer>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    marginBottom: spacing.lg,
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
  systemListGroup: {
    gap: spacing.sm + 2,
    marginTop: spacing.sm + 2,
  },
  divider: {},
});
