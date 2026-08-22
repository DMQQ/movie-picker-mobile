import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";
import FormSheetContainer from "../../components/FormSheetContainer";
import SearchField from "../../components/SearchField";
import Text from "../../components/Text";
import Touch from "../../components/Touch";
import { colors, fontSize, fontWeight, radius, spacing, withAlpha } from "../../constants/design";
import { useLazySearchQuery } from "../../redux/movie/movieApi";
import { useGetListsQuery, useAddBulkItemsMutation } from "../../redux/lists/listsApi";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { loadFavorites } from "../../redux/favourites/favourites";
import { moviePickerActions } from "../../redux/moviePicker/moviePickerSlice";
import useTranslation from "../../service/useTranslation";
import { posthog } from "../../constants/posthog";

const POSTER_BASE = "https://image.tmdb.org/t/p/w185";
const HIDDEN_TYPES = new Set(["superliked", "disliked"]);

interface SearchItem {
  id: number;
  title: string;
  poster_path: string | null;
  media_type: "movie" | "tv";
  vote_average: number;
  runtime: number;
}

function formatRuntime(mins: number): string {
  if (mins <= 0) return "";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function MoviePickerIndex() {
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const params = useLocalSearchParams<{ targetListType?: string; targetListName?: string }>();
  const targetListType = params.targetListType ?? "";
  const targetListName = params.targetListName ?? "";
  const isListAddMode = !!targetListType;

  const selected = useAppSelector((s) => s.moviePicker.selected);
  const groups = useAppSelector((s) => s.favourite.groups);
  const isAuthenticated = useAppSelector(
    (s) => !!s.auth.user && s.auth.user.provider !== "anonymous",
  );

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>(null);
  const [search, { isFetching }] = useLazySearchQuery();
  const [addBulkItems] = useAddBulkItemsMutation();

  const { data: listsData, isLoading: loadingLists } = useGetListsQuery(
    { limit: 50 },
    { skip: !isAuthenticated },
  );

  useEffect(() => {
    if (!isAuthenticated) dispatch(loadFavorites());
    if (!isListAddMode) posthog?.capture("custom_room_movies_picker_opened");
    if (isListAddMode) {
      dispatch(moviePickerActions.init({}));
      search({ page: 1, type: "both" }).unwrap()
        .then((res) => setSearchResults(res.results.map((m: any) => ({
          id: m.id,
          title: m.title ?? m.name ?? "",
          poster_path: m.poster_path ?? null,
          media_type: m.type ?? m.media_type ?? (m.first_air_date ? "tv" : "movie"),
          vote_average: m.vote_average ?? 0,
          runtime: m.runtime ?? 0,
        }))))
        .catch(() => {});
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setSearchResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await search({ query: query.trim(), page: 1, type: "both" }).unwrap();
        setSearchResults(res.results.map((m: any) => ({
          id: m.id,
          title: m.title ?? m.name ?? "",
          poster_path: m.poster_path ?? null,
          media_type: m.type ?? m.media_type ?? (m.first_air_date ? "tv" : "movie"),
          vote_average: m.vote_average ?? 0,
          runtime: m.runtime ?? 0,
        })));
      } catch {}
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const selectedSet = new Set(selected.map((m) => m.id));
  const isSearching = !!query.trim();

  const handleToggle = useCallback((item: SearchItem) => {
    dispatch(moviePickerActions.toggle({ id: item.id, title: item.title, poster_path: item.poster_path ?? "", contentType: item.media_type }));
  }, [dispatch]);

  const handleConfirm = useCallback(async () => {
    if (isListAddMode && selected.length > 0) {
      try {
        await addBulkItems({
          type: targetListType,
          items: selected.map((m) => ({
            contentId: m.id,
            contentType: m.contentType ?? "movie",
            content: { title: m.title, poster_path: m.poster_path || null },
          })),
        }).unwrap();
      } catch {}
      router.back();
      return;
    }
    dispatch(moviePickerActions.confirm());
    router.back();
  }, [dispatch, isListAddMode, selected, addBulkItems, targetListType]);

  const handleOpenAuthList = (list: { id: string; type: string; name: string }) => {
    router.push({
      pathname: "/movie-picker/[listId]",
      params: { listId: list.id, listType: list.type, listName: list.name, targetListType, targetListName },
    });
  };

  const handleOpenLocalGroup = (groupId: string) => {
    router.push({
      pathname: "/movie-picker/[listId]",
      params: { listId: groupId, listName: groups.find((g) => g.id === groupId)?.name ?? "", isLocal: "true", targetListType, targetListName },
    });
  };

  const authLists = (listsData?.lists ?? []).filter((l) => !HIDDEN_TYPES.has(l.type));
  const localGroups = groups.filter((g) => g.movies.length > 0);

  return (
    <FormSheetContainer padX={spacing.lg}>
      {/* Search */}
      <View style={styles.header}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t("search.search-placeholder") as string}
          style={styles.searchField}
        />
        {isFetching && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      <Text style={styles.sectionLabel}>
        {isSearching ? "Search results" : isListAddMode ? `Add to ${targetListName}` : "Your lists"}
      </Text>

      {isSearching || isListAddMode ? (
        <Animated.View key="search" entering={FadeIn.duration(150)} style={{ flex: 1 }}>
          <FlashList
            data={searchResults}
            keyExtractor={(item) => String(item.id)}
            estimatedItemSize={68}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <Touch scaleTo={0.97} onPress={() => handleToggle(item)} style={styles.row}>
                <Image
                  source={item.poster_path ? { uri: `${POSTER_BASE}${item.poster_path}` } : undefined}
                  style={styles.poster}
                  contentFit="cover"
                />
                <View style={styles.rowInfo}>
                  <Text numberOfLines={2} style={styles.rowTitle}>{item.title}</Text>
                  <View style={styles.rowMeta}>
                    <Text style={styles.metaText}>{item.media_type === "tv" ? "TV" : "Movie"}</Text>
                    {item.vote_average > 0 && (
                      <>
                        <Text style={styles.metaDot}>·</Text>
                        <MaterialCommunityIcons name="star" size={11} color="#FFB800" />
                        <Text style={styles.metaText}>{item.vote_average.toFixed(1)}</Text>
                      </>
                    )}
                    {item.runtime > 0 && (
                      <>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{formatRuntime(item.runtime)}</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={[styles.check, selectedSet.has(item.id) && styles.checkActive]}>
                  {selectedSet.has(item.id) && <MaterialCommunityIcons name="check" size={14} color={colors.text} />}
                </View>
              </Touch>
            )}
            ListEmptyComponent={
              !isFetching && isSearching ? <Text style={styles.empty}>{t("search.no-results") as string}</Text> : null
            }
          />
        </Animated.View>
      ) : (
        <Animated.View key="lists" entering={FadeIn.duration(150)} style={{ flex: 1 }}>
          {isAuthenticated ? (
            loadingLists ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
            ) : (
              <FlashList
                data={authLists}
                keyExtractor={(l) => l.id}
                estimatedItemSize={68}
                contentContainerStyle={styles.listPad}
                renderItem={({ item: list }) => {
                  const countInList = 0; // detailed count only available after opening
                  return (
                    <Touch scaleTo={0.97} onPress={() => handleOpenAuthList(list)} style={styles.row}>
                      {list.posterPath ? (
                        <Image source={{ uri: `${POSTER_BASE}${list.posterPath}` }} style={styles.poster} contentFit="cover" />
                      ) : (
                        <View style={[styles.poster, styles.posterFallback]}>
                          <MaterialCommunityIcons name="format-list-bulleted" size={18} color={colors.placeholder} />
                        </View>
                      )}
                      <Text style={styles.rowTitle}>{list.name}</Text>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.placeholder} />
                    </Touch>
                  );
                }}
                ListEmptyComponent={<Text style={styles.empty}>No lists yet — search above</Text>}
              />
            )
          ) : (
            <FlashList
              data={localGroups}
              keyExtractor={(g) => g.id}
              estimatedItemSize={68}
              contentContainerStyle={styles.listPad}
              renderItem={({ item: group }) => {
                const selectedInGroup = group.movies.filter((m) => selectedSet.has(m.id)).length;
                return (
                  <Touch scaleTo={0.97} onPress={() => handleOpenLocalGroup(group.id)} style={styles.row}>
                    {group.posterPath ? (
                      <Image source={{ uri: `${POSTER_BASE}${group.posterPath}` }} style={styles.poster} contentFit="cover" />
                    ) : (
                      <View style={[styles.poster, styles.posterFallback]}>
                        <MaterialCommunityIcons name="format-list-bulleted" size={18} color={colors.placeholder} />
                      </View>
                    )}
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.rowTitle}>{group.name}</Text>
                      {selectedInGroup > 0 && (
                        <Text style={styles.selectedHint}>{selectedInGroup} selected</Text>
                      )}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.placeholder} />
                  </Touch>
                );
              }}
              ListEmptyComponent={<Text style={styles.empty}>No saved movies — search above</Text>}
            />
          )}
        </Animated.View>
      )}

      <Pressable
        onPress={handleConfirm}
        disabled={isListAddMode ? selected.length === 0 : selected.length < 10}
        style={[styles.confirm, (isListAddMode ? selected.length === 0 : selected.length < 10) && styles.confirmDisabled]}
      >
        <Text style={styles.confirmText}>
          {isListAddMode
            ? selected.length > 0 ? `Done (${selected.length})` : "Done"
            : selected.length === 0
              ? "Select 10+ movies"
              : selected.length < 10
                ? `${selected.length} / 10 selected`
                : `Done (${selected.length})`}
        </Text>
      </Pressable>
    </FormSheetContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  searchField: { flex: 1, backgroundColor: colors.input, borderRadius: radius.pill },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.placeholder,
    paddingHorizontal: 0,
    paddingBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  listPad: { paddingHorizontal: 0, paddingBottom: spacing.lg },
  empty: { textAlign: "center", marginTop: spacing.xxl, opacity: 0.5, fontSize: fontSize.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  poster: {
    width: 38,
    height: 54,
    borderRadius: radius.xs + 1,
    backgroundColor: colors.surfaceElevated,
  },
  posterFallback: { alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1, gap: 3 },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: fontSize.xs, color: colors.placeholder },
  metaDot: { fontSize: fontSize.xs, color: colors.placeholder },
  selectedHint: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  confirm: {
    marginTop: spacing.lg,
    marginBottom: -spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDisabled: { opacity: 0.4 },
  confirmText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
});
