import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Touch from "../../components/Touch";
import SearchField from "../../components/SearchField";
import Text from "../../components/Text";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";
import { listsApi } from "../../redux/lists/listsApi";
import { movieApi } from "../../redux/movie/movieApi";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { moviePickerActions } from "../../redux/moviePicker/moviePickerSlice";
import useTranslation from "../../service/useTranslation";

const POSTER_BASE = "https://image.tmdb.org/t/p/w185";

interface RowItem { id: number; title: string; poster_path: string | null }

export default function MoviePickerListDetail() {
  const params = useLocalSearchParams<{ listId: string; listType?: string; listName?: string; isLocal?: string }>();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const insets = useSafeAreaInsets();

  const selected = useAppSelector((s) => s.moviePicker.selected);
  const groups = useAppSelector((s) => s.favourite.groups);

  const [items, setItems] = useState<RowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const isLocal = params.isLocal === "true";

  useEffect(() => {
    if (isLocal) {
      const group = groups.find((g) => g.id === params.listId);
      const raw = group?.movies ?? [];

      // Movies that already have titles stored — no fetch needed
      const withTitle = raw.filter((m) => !!m.title);
      const needTitle = raw.filter((m) => !m.title);

      const initial: RowItem[] = withTitle.map((m) => ({
        id: m.id, title: m.title!, poster_path: m.imageUrl ?? null,
      }));
      setItems(initial);

      if (needTitle.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch titles in parallel for movies stored without one
      Promise.all(
        needTitle.map((m) =>
          dispatch(movieApi.endpoints.getMovie.initiate({ id: m.id, type: m.type ?? "movie" }))
            .unwrap()
            .then((detail) => ({
              id: m.id,
              title: detail.title ?? detail.name ?? `Movie ${m.id}`,
              poster_path: detail.poster_path ?? m.imageUrl ?? null,
            }))
            .catch(() => ({
              id: m.id,
              title: `Movie ${m.id}`,
              poster_path: m.imageUrl ?? null,
            })),
        ),
      ).then((resolved) => {
        setItems((prev) => {
          const existing = new Set(prev.map((x) => x.id));
          return [...prev, ...resolved.filter((x) => !existing.has(x.id))];
        });
        setLoading(false);
      });

      return;
    }

    const listType = params.listType ?? params.listId;
    dispatch(listsApi.endpoints.getList.initiate(listType))
      .unwrap()
      .then((result) => {
        setItems(
          (result.items ?? [])
            .filter((item) => !!item.content?.title)
            .map((item) => ({
              id: item.contentId,
              title: item.content!.title!,
              poster_path: item.content?.poster_path ?? null,
            })),
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [params.listId]);

  const selectedSet = new Set(selected.map((m) => m.id));

  const filtered = query.trim()
    ? items.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    : items;

  const selectedInList = items.filter((m) => selectedSet.has(m.id)).length;

  const handleToggle = useCallback((item: RowItem) => {
    dispatch(moviePickerActions.toggle({ id: item.id, title: item.title, poster_path: item.poster_path ?? "" }));
  }, [dispatch]);

  const handleConfirm = useCallback(() => {
    dispatch(moviePickerActions.confirm());
    // Pop back to root and dismiss
    router.dismissAll();
  }, [dispatch]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.sm }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{params.listName ?? "List"}</Text>
          {selectedInList > 0 && (
            <Text style={styles.subtitle}>{selectedInList} selected</Text>
          )}
        </View>
      </View>

      {/* Filter within list */}
      <View style={styles.searchWrap}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Filter this list…"
          style={styles.searchField}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          estimatedItemSize={68}
          contentContainerStyle={styles.listPad}
          renderItem={({ item }) => {
            const sel = selectedSet.has(item.id);
            return (
              <Touch scaleTo={0.97} onPress={() => handleToggle(item)} style={styles.row}>
                <Image
                  source={item.poster_path ? { uri: `${POSTER_BASE}${item.poster_path}` } : undefined}
                  style={styles.poster}
                  contentFit="cover"
                />
                <Text numberOfLines={2} style={styles.rowTitle}>{item.title}</Text>
                <View style={[styles.check, sel && styles.checkActive]}>
                  {sel && <MaterialCommunityIcons name="check" size={14} color={colors.text} />}
                </View>
              </Touch>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query.trim() ? t("search.no-results") as string : "Nothing in this list"}
            </Text>
          }
        />
      )}

      <View style={styles.footer}>
        <Touch onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </Touch>
        <Pressable
          onPress={handleConfirm}
          disabled={selected.length === 0}
          style={[styles.confirm, selected.length === 0 && styles.confirmDisabled]}
        >
          <Text style={styles.confirmText}>
            {selected.length > 0 ? `Done (${selected.length})` : "Done"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerText: { flex: 1 },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },
  searchWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  searchField: { backgroundColor: colors.input, borderRadius: radius.pill },
  listPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
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
  rowTitle: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text },
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirm: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDisabled: { opacity: 0.4 },
  confirmText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
});
