import { FlatList, Pressable, StyleSheet, View } from "react-native";
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

  const removeMovie = (id: number) => {
    const movie = movies.find((m) => m.id === id);
    if (movie) dispatch(moviePickerActions.toggle(movie));
  };

  const hasMovies = movies.length > 0;
  const needsMore = hasMovies && movies.length < MIN_MOVIES;
  const thumbs = movies.slice(0, 4);
  const overflow = movies.length - thumbs.length;

  return (
    <View style={styles.container}>
      {hasMovies ? (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.selectionHeader}>
          {/* Overlapping poster stack */}
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
        <Animated.View entering={FadeInDown.duration(300)}>
          <Touch scaleTo={0.97} onPress={openPicker} style={styles.emptyCard}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="playlist-plus" size={28} color={colors.primary} />
            </View>
            <View style={styles.emptyTextCol}>
              <Text style={styles.emptyTitle}>Pick your movies</Text>
              <Text style={styles.emptySub}>Choose from your lists or search</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.placeholder} />
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

  // — Empty state CTA card —
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: withAlpha(colors.primary, 0.35),
    borderStyle: "dashed",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: withAlpha(colors.primary, 0.12),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTextCol: { flex: 1, gap: 2 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  emptySub: { fontSize: fontSize.sm, color: colors.placeholder },

  // — Selection header (has movies) —
  selectionHeader: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  thumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  thumbStack: {
    position: "relative",
    height: THUMB_H,
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

  // — Poster grid —
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
