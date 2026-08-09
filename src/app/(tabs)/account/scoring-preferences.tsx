import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageHeading from "../../../components/PageHeading";
import Text from "../../../components/Text";
import TextInput from "../../../components/TextInput";
import Icon from "../../../components/Icon";
import {
  useGetScoringPreferencesQuery,
  useRemoveScoringItemsMutation,
  useResetScoringPreferencesMutation,
  type ScoringGenre,
  type ScoringKeyword,
} from "../../../redux/scoringPreferences/scoringPreferencesApi";
import { colors, fontSize, fontWeight, radius, spacing } from "../../../constants/design";

type ContentType = "movie" | "tv";
type ViewTab = "genres" | "keywords";
const KEYWORDS_LIMIT = 50;

export default function ScoringPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [contentType, setContentType] = useState<ContentType>("movie");
  const [viewTab, setViewTab] = useState<ViewTab>("genres");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search to avoid hammering the API
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Infinite scroll for keywords + optimistic removal
  const [keywordPage, setKeywordPage] = useState(1);
  const [allKeywords, setAllKeywords] = useState<ScoringKeyword[]>([]);
  const [removedGenreIds, setRemovedGenreIds] = useState<Set<number>>(new Set());

  const { data, isFetching } = useGetScoringPreferencesQuery({
    type: contentType,
    page: viewTab === "keywords" ? keywordPage : undefined,
    limit: viewTab === "keywords" ? KEYWORDS_LIMIT : undefined,
    q: debouncedSearch || undefined,
  });
  const [removeItems] = useRemoveScoringItemsMutation();
  const [resetAll] = useResetScoringPreferencesMutation();

  const profile = data?.[contentType];

  // Accumulate keywords across pages
  useEffect(() => {
    if (viewTab !== "keywords" || !data?.[contentType]) return;
    const kw = data[contentType]!.keywords;
    if (keywordPage === 1) {
      setAllKeywords(kw);
    } else {
      setAllKeywords((prev) => {
        const seen = new Set(prev.map((k) => k.id));
        return [...prev, ...kw.filter((k) => !seen.has(k.id))];
      });
    }
  }, [data, contentType, keywordPage, viewTab]);

  const totalKeywords = profile?.keywordsTotal ?? 0;
  const hasMore = viewTab === "keywords" && allKeywords.length < totalKeywords;
  const isEmpty = !profile || (profile.genres.length === 0 && totalKeywords === 0);

  const resetPagination = () => {
    setKeywordPage(1);
    setAllKeywords([]);
  };

  const handleContentTypeChange = (ct: ContentType) => {
    setContentType(ct);
    setViewTab("genres");
    setSearch("");
    setRemovedGenreIds(new Set());
    resetPagination();
  };

  const handleViewTabChange = (tab: ViewTab) => {
    setViewTab(tab);
    setSearch("");
    setRemovedGenreIds(new Set());
    resetPagination();
  };

  const handleRemoveGenre = (id: number) => {
    setRemovedGenreIds((prev) => new Set(prev).add(id));
    removeItems({ genres: [id], contentType });
  };

  const handleRemoveKeyword = (id: number) => {
    setAllKeywords((prev) => prev.filter((k) => k.id !== id));
    removeItems({ keywords: [id], contentType });
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Taste Profile",
      `Erase all learned ${contentType === "movie" ? "movie" : "TV"} preferences?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetAll(contentType);
            resetPagination();
          },
        },
      ],
    );
  };

  const loadMore = () => {
    if (!isFetching && hasMore) setKeywordPage((p) => p + 1);
  };

  // Reset pagination when search changes
  useEffect(() => {
    resetPagination();
  }, [debouncedSearch]);

  // Items come straight from the API (backend handles search + pagination)
  const genres = (profile?.genres ?? []).filter((g) => !removedGenreIds.has(g.id));
  const items = viewTab === "genres" ? genres : allKeywords;

  const headerTop = insets.top + spacing.xxl * 2 + spacing.lg;

  const renderItem = ({ item }: { item: ScoringGenre | ScoringKeyword }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemScore}>{Math.round(item.score)}%</Text>
      <Pressable
        onPress={() =>
          viewTab === "genres"
            ? handleRemoveGenre(item.id)
            : handleRemoveKeyword(item.id)
        }
        style={styles.removeBtn}
        hitSlop={8}
      >
        <Icon source="close" size={14} color={colors.placeholder} />
      </Pressable>
    </View>
  );

  const footer = () => {
    if (isEmpty) return null;
    return (
      <View style={styles.footer}>
        {isFetching && viewTab === "keywords" && (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Icon source="delete-outline" size={16} color={colors.error} />
          <Text style={styles.resetText}>
            Reset all {contentType === "movie" ? "movie" : "TV"} preferences
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <PageHeading title="Taste Profile" gradientHeight={60} showGradientBackground />

      {/* Fixed header */}
      <View style={[styles.fixedHeader, { paddingTop: headerTop }]}>
        {/* Breadcrumb: Movies › Genres */}
        <View style={styles.breadcrumb}>
          <Pressable
            style={styles.crumbPill}
            onPress={() => handleContentTypeChange(contentType === "movie" ? "tv" : "movie")}
          >
            <Text style={styles.crumbText}>{contentType === "movie" ? "Movies" : "TV Shows"}</Text>
            <Icon source="chevron-down" size={10} color={colors.placeholder} />
          </Pressable>
          <Icon source="chevron-right" size={14} color={colors.placeholder} />
          <Pressable
            style={styles.crumbPill}
            onPress={() => handleViewTabChange(viewTab === "genres" ? "keywords" : "genres")}
          >
            <Text style={styles.crumbText}>
              {viewTab === "genres"
                ? "Genres"
                : `Keywords${totalKeywords > 0 ? ` (${totalKeywords})` : ""}`}
            </Text>
            <Icon source="chevron-down" size={10} color={colors.placeholder} />
          </Pressable>
        </View>

        {!isEmpty && (
          <>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Search ${viewTab}...`}
              style={styles.searchInput}
            />
            <View style={styles.legend}>
              <Icon source="information-outline" size={12} color={colors.placeholder} />
              <Text style={styles.legendText}>0 = weakest · 100 = strongest preference</Text>
            </View>
          </>
        )}
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {isEmpty ? "No preferences yet" : "No matches"}
            </Text>
            <Text style={styles.emptySubtext}>
              {isEmpty
                ? "Play more games to build your taste profile."
                : "Try a different search term."}
            </Text>
          </View>
        }
        ListFooterComponent={footer}
        onEndReached={viewTab === "keywords" ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.appBackground },

  // Fixed header
  fixedHeader: {
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  crumbPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radius.pill,
  },
  crumbText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  // Search
  searchInput: { backgroundColor: "transparent" },

  // Legend
  legend: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  legendText: { fontSize: fontSize.sm, color: colors.placeholder },

  // List
  listContent: { paddingHorizontal: spacing.screen, gap: spacing.sm },

  // Item row
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm + 2,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  itemName: { fontSize: fontSize.md, color: colors.text, flex: 1, flexShrink: 1 },
  itemScore: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    minWidth: 36,
    textAlign: "right",
  },
  removeBtn: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footer: { gap: spacing.xl, paddingTop: spacing.xl },
  loadingText: { fontSize: fontSize.sm, color: colors.placeholder, textAlign: "center" },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl * 2, gap: spacing.sm },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text },
  emptySubtext: { fontSize: fontSize.md, color: colors.placeholder, textAlign: "center" },

  // Reset
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm + 2,
    opacity: 0.8,
  },
  resetText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.error },
});
