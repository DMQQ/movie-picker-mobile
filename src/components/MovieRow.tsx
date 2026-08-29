import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Icon from "./Icon";
import Text from "./Text";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import { colors, fontSize, radius, spacing } from "../constants/design";

export interface MovieRowProps {
  id: number;
  title: string;
  posterPath: string;
  type?: string;
  year?: string;
  score?: number;       // 0–10
  scoreDisplay?: "score" | "stars"; // "score" = ★ 7.5, "stars" = ★★★★☆
  source?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  trailing?: ReactNode;
  children?: ReactNode; // injected below title/meta
}

export default function MovieRow({
  id,
  title,
  posterPath,
  type = "movie",
  year,
  score,
  scoreDisplay = "score",
  source,
  onPress,
  onLongPress,
  trailing,
  children,
}: MovieRowProps) {
  const resolvedType = type.includes("movie") ? "movie" : "tv";

  const handlePress = onPress ?? (() =>
    router.push({
      pathname: "/movie/type/[type]/[id]",
      params: { type: resolvedType, id: String(id), img: posterPath, source },
    } as any)
  );

  return (
    <Pressable style={styles.row} onPress={handlePress} onLongPress={onLongPress}>
      <Thumbnail
        path={posterPath}
        size={ThumbnailSizes.poster.small}
        container={{ width: 42, height: 62, borderRadius: radius.xs + 2 }}
        showsPlaceholder={false}
        priority="low"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {(score != null || year) && (
          <View style={styles.meta}>
            {score != null && scoreDisplay === "stars" && (
              Array.from({ length: 10 }, (_, i) => {
                const filled = score >= i + 1;
                const half = !filled && score >= i + 0.5;
                return (
                  <Icon
                    key={i}
                    source={filled ? "star" : half ? "star-half-full" : "star-outline"}
                    size={10}
                    color="#FFD700"
                  />
                );
              })
            )}
            {score != null && scoreDisplay === "score" && (
              <>
                <Icon source="star" size={10} color="#FFD700" />
                <Text style={styles.metaText}>{score.toFixed(1)}</Text>
              </>
            )}
            {score != null && !!year && <Text style={styles.dot}>·</Text>}
            {!!year && <Text style={styles.metaText}>{year}</Text>}
          </View>
        )}
        {children}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: fontSize.lg,
    color: colors.text,
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 1,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  dot: {
    fontSize: fontSize.sm,
    color: colors.border,
  },
});
