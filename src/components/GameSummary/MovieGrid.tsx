import { useCallback, useMemo } from "react";
import type { ReactElement } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import Text from "../Text";
import Button from "../Button";
import MatchedItem from "./MatchedItem";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, spacing, typography } from "../../constants/design";

export interface MovieLike {
  id?: number;
  title?: string;
  poster_path?: string;
}

export type SummaryTab = "matches" | "likes";

type EmptyItem = { type: "empty"; key: string };

type RowItem = {
  type: "row";
  key: string;
  movies: MovieLike[];
  badgeFlags: boolean[];
};

type ListItem = EmptyItem | RowItem;

interface MovieGridProps {
  matches: MovieLike[];
  likes: MovieLike[];
  tab: SummaryTab;
  summaryType: string;
  onTryAgain: () => void;
  header: ReactElement;
}

export default function MovieGrid({
  matches,
  likes,
  tab,
  summaryType,
  onTryAgain,
  header,
}: MovieGridProps) {
  const t = useTranslation();
  const hasMatches = matches.length > 0;

  const noMatchContent = useMemo(() => {
    const titles = t("game-summary.no-matches-titles") as unknown as string[];
    const descs = t("game-summary.no-matches-descs") as unknown as string[];
    const idx = Math.floor(Math.random() * titles.length);
    return { title: titles[idx], desc: descs[idx] };
  }, [t]);

  const noPicksContent = useMemo(() => {
    const titles = t("game-summary.no-picks-titles") as unknown as string[];
    const descs = t("game-summary.no-picks-descs") as unknown as string[];
    const idx = Math.floor(Math.random() * titles.length);
    return { title: titles[idx], desc: descs[idx] };
  }, [t]);

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    if (tab === "matches") {
      if (hasMatches) {
        for (let i = 0; i < matches.length; i += 3) {
          items.push({
            type: "row",
            key: `row-matched-${i}`,
            movies: matches.slice(i, i + 3),
            badgeFlags: [],
          });
        }
      } else {
        items.push({ type: "empty", key: "empty-matches" });
      }
    } else {
      if (likes.length > 0) {
        for (let i = 0; i < likes.length; i += 3) {
          const row = likes.slice(i, i + 3);
          items.push({
            type: "row",
            key: `row-picks-${i}`,
            movies: row,
            badgeFlags: row.map((m) => matches.some((mm) => mm.id === m.id)),
          });
        }
      } else {
        items.push({ type: "empty", key: "empty-likes" });
      }
    }

    return items;
  }, [tab, hasMatches, matches, likes]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "empty") {
        if (tab === "matches") {
          return (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{noMatchContent.title}</Text>
              <Text style={styles.emptyDesc}>{noMatchContent.desc}</Text>
            </View>
          );
        }
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{noPicksContent.title}</Text>
            <Text style={styles.emptyDesc}>{noPicksContent.desc}</Text>
          </View>
        );
      }

      return (
        <View style={styles.movieRow}>
          {item.movies.map((movie, idx) => (
            <View key={movie.id ?? idx} style={styles.movieCell}>
              <MatchedItem
                {...movie}
                summary={{ type: summaryType }}
                badge={item.badgeFlags[idx] ?? false}
              />
            </View>
          ))}
          {Array.from({ length: 3 - item.movies.length }).map((_, i) => (
            <View key={`ph-${i}`} style={styles.movieCell} />
          ))}
        </View>
      );
    },
    [tab, summaryType, t, noMatchContent, noPicksContent, onTryAgain],
  );

  return (
    <FlatList
      data={listData}
      renderItem={renderItem}
      ListHeaderComponent={header}
      keyExtractor={(item) => item.key}
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 90,
  },
  movieRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginBottom: spacing.screen,
  },
  movieCell: { flex: 1 },
  emptyState: {
    flex: 1,
    marginBottom: spacing.xxl + 6,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.bebasSize.empty,
    fontFamily: "Bebas",
  },
  emptyDesc: {
    color: colors.text,
    fontSize: fontSize.lg,
    marginVertical: spacing.sm,
  },
});
