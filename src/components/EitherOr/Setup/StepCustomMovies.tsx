import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useEffect, useCallback } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Text from "../../Text";
import Touch from "../../Touch";
import { colors, fontSize, fontWeight, radius, spacing, withAlpha } from "../../../constants/design";
import { useAppDispatch } from "../../../redux/store";
import { moviePickerActions, type PickedMovie } from "../../../redux/moviePicker/moviePickerSlice";

const POSTER_BASE = "https://image.tmdb.org/t/p/w185";
const MIN_MOVIES = 4;
const THUMB_W = 32;
const THUMB_H = 48;
const THUMB_OVERLAP = 10;

interface Props {
  movies: PickedMovie[];
}

export default function StepCustomMovies({ movies }: Props) {
  const dispatch = useAppDispatch();

  const openPicker = () => {
    dispatch(moviePickerActions.init({ initial: movies }));
    router.push("/movie-picker/");
  };

  useEffect(() => {
    if (movies.length === 0) {
      openPicker();
    }
  }, []);

  const removeMovie = useCallback((id: number) => {
    const movie = movies.find((m) => m.id === id);
    if (movie) dispatch(moviePickerActions.toggle(movie));
  }, [movies, dispatch]);

  const hasMovies = movies.length > 0;
  const needsMore = hasMovies && movies.length < MIN_MOVIES;
  const thumbs = movies.slice(0, 4);
  const overflow = movies.length - thumbs.length;

  return (
    <View style={styles.container}>
      {hasMovies ? (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.selectionHeader}>
          <Touch onPress={openPicker} style={styles.thumbRow}>
            <View style={[styles.thumbStack, { width: THUMB_W + (thumbs.length - 1) * (THUMB_W - THUMB_OVERLAP) }]}>
              {thumbs.map((m, i) => (
                <Image
                  key={m.id}
                  source={m.poster_path ? { uri: `${POSTER_BASE}${m.poster_path}` } : undefined}
                  style={[styles.thumb, { left: i * (THUMB_W - THUMB_OVERLAP), zIndex: i }]}
                  contentFit="cover"
                />
              ))}
              {overflow > 0 && (
                <View style={[styles.thumb, styles.overflowBadge, { left: thumbs.length * (THUMB_W - THUMB_OVERLAP), zIndex: thumbs.length }]}>
                  <Text style={styles.overflowText}>+{overflow}</Text>
                </View>
              )}
            </View>

            <View style={styles.selectionMeta}>
              <Text style={styles.selectionCount}>
                {movies.length} movie{movies.length !== 1 ? "s" : ""}
              </Text>
              {needsMore ? (
                <Text style={styles.selectionHint}>
                  {MIN_MOVIES - movies.length} more needed
                </Text>
              ) : (
                <Text style={styles.selectionHint}>Ready to play</Text>
              )}
            </View>

            <View style={styles.editChip}>
              <Text style={styles.editChipText}>Edit</Text>
              <MaterialCommunityIcons name="pencil-outline" size={13} color={colors.primary} />
            </View>
          </Touch>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name="playlist-plus" size={44} color={colors.primary} />
          </View>
          <Text style={styles.emptyHeading}>No movies selected</Text>
          <Text style={styles.emptyMessage}>Open the picker to choose at least {MIN_MOVIES} movies</Text>
          <Touch scaleTo={0.97} onPress={openPicker} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Pick movies</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={colors.text} />
          </Touch>
        </Animated.View>
      )}

      {hasMovies && (
        <Animated.View entering={FadeInDown.duration(300).delay(60)} style={styles.gridWrap}>
          <FlatList
            data={movies}
            keyExtractor={(m) => String(m.id)}
            numColumns={4}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <View style={styles.tile}>
                <Image
                  source={item.poster_path ? { uri: `${POSTER_BASE}${item.poster_path}` } : undefined}
                  style={styles.poster}
                  contentFit="cover"
                />
                <Pressable onPress={() => removeMovie(item.id)} style={styles.removeBtn} hitSlop={6}>
                  <MaterialCommunityIcons name="close" size={10} color={colors.text} />
                </Pressable>
                <Text numberOfLines={2} style={styles.tileTitle}>{item.title}</Text>
              </View>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxl,
    gap: spacing.lg,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: withAlpha(colors.primary, 0.12),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHeading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: fontSize.md,
    color: colors.placeholder,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
  },
  emptyButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  selectionHeader: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  thumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    overflow: "hidden",
  },
  thumbStack: {
    position: "relative",
    height: THUMB_H,
    overflow: "hidden",
  },
  thumb: {
    position: "absolute",
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: radius.xs + 1,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  overflowBadge: {
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  overflowText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.placeholder,
  },
  selectionMeta: {
    flex: 1,
    gap: 2,
  },
  selectionCount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  selectionHint: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  editChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.primary, 0.12),
  },
  editChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },

  gridWrap: { marginHorizontal: spacing.lg },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm },
  tile: {
    flex: 1,
    maxWidth: "25%",
    alignItems: "center",
    gap: spacing.xs - 2,
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  removeBtn: {
    position: "absolute",
    top: spacing.xs - 2,
    right: spacing.xs - 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    textAlign: "center",
  },
});
