import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../components/Text";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import IconButton from "../../components/IconButton";
import AvatarText from "../../components/AvatarText";
import PageHeading from "../../components/PageHeading";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import GroupScreenLayout from "../../components/Group/GroupScreenLayout";
import { useSuperLikedMovies } from "../../hooks/useSuperLikedMovies";
import { useGetMyRatingsQuery, type UserRating } from "../../redux/ratings/ratingsApi";
import { useAppSelector } from "../../redux/store";
import { getUserAvatarColor, getInitials } from "../../utils/avatar";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";

const POSTER_W = 42;
const POSTER_H = 62;

function RatingRow({
  movieId,
  contentType,
  ratingsMap,
  user,
}: {
  movieId: number;
  contentType: string;
  ratingsMap: Map<string, UserRating>;
  user: { name: string } | null;
}) {
  const t = useTranslation();
  const rating = ratingsMap.get(`${contentType}:${movieId}`);

  const openRateSheet = () =>
    router.push({
      pathname: "/rate-movie",
      params: {
        movieId: String(movieId),
        contentType,
        rating: rating?.rating != null ? String(rating.rating) : "",
        review: rating?.review ?? "",
      },
    } as any);

  return (
    <Pressable onPress={openRateSheet} style={styles.reviewPressable}>
      <AvatarText
        label={getInitials(user?.name ?? "?")}
        size={22}
        style={{ backgroundColor: getUserAvatarColor(user?.name ?? "") }}
      />
      <View style={styles.reviewContent}>
        {rating ? (
          <>
            <View style={styles.starRow}>
              {Array.from({ length: 10 }, (_, i) => (
                <Icon
                  key={i}
                  source={i < rating.rating ? "star" : "star-outline"}
                  size={10}
                  color={i < rating.rating ? "#FFD700" : colors.border}
                />
              ))}
              <Text style={styles.ratingNum}>{rating.rating}/10</Text>
            </View>
            {rating.review ? (
              <Text style={styles.reviewText} numberOfLines={1}>{rating.review}</Text>
            ) : (
              <Text style={styles.noReviewText}>{t("lists.noReview")}</Text>
            )}
          </>
        ) : (
          <Text style={styles.noReviewText}>{t("ratings.rateTitle")}</Text>
        )}
      </View>
      <Icon source="pencil-outline" size={10} color="rgba(255,255,255,0.2)" />
    </Pressable>
  );
}

export default function SuperLikedGroup() {
  const { superLikedMovies, removeSuperLike } = useSuperLikedMovies();
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  const t = useTranslation();
  const insets = useSafeAreaInsets();

  const openMoviePicker = () =>
    router.push({
      pathname: "/movie-picker",
      params: { targetListType: "superliked", targetListName: t("super-liked.title") },
    } as any);

  const { data: ratingsData } = useGetMyRatingsQuery({ limit: 200 }, { skip: !isFullAccount });

  const ratingsMap = useMemo(() => {
    const map = new Map<string, UserRating>();
    for (const r of ratingsData?.ratings ?? []) {
      map.set(`${r.contentType}:${r.contentId}`, r);
    }
    return map;
  }, [ratingsData]);

  const tileData = useMemo(
    () => superLikedMovies.map((m) => ({
      id: m.movie_id,
      poster_path: m.poster_path || "",
      title: m.title || "",
      type: m.movie_type,
    })),
    [superLikedMovies],
  );

  const banner = (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="star-circle" size={22} color="#FFD700" style={styles.bannerIcon} />
      <Text style={styles.bannerText}>
        Super liked movies appear more often in your games — share your taste with friends so your favorites show up when playing together.
      </Text>
    </View>
  );

  if (!isFullAccount) {
    return (
      <GroupScreenLayout
        title={t("super-liked.title") as string}
        data={tileData}
        useMovieType
        subheader={banner}
        renderItemFooter={(item) => (
          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={() => removeSuperLike(item.id, item.type as "movie" | "tv")}
              style={styles.button}
              textColor="#FFD700"
              compact
            >
              {t("super-liked.remove") as string}
            </Button>
          </View>
        )}
      />
    );
  }

  return (
    <SafeIOSContainer style={styles.container}>
      <PageHeading
        title={t("super-liked.title") as string}
        showRightIconButton
        rightIconName="plus"
        onRightIconPress={openMoviePicker}
      />
      <FlatList
        data={superLikedMovies}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => `${item.movie_type}_${item.movie_id}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              style={styles.rowMain}
              onPress={() =>
                router.push({
                  pathname: "/movie/type/[type]/[id]",
                  params: { type: item.movie_type ?? "movie", id: String(item.movie_id), img: item.poster_path ?? "" },
                } as any)
              }
            >
              <Thumbnail
                path={item.poster_path ?? ""}
                size={ThumbnailSizes.poster.small}
                container={{ width: POSTER_W, height: POSTER_H, borderRadius: radius.xs + 2 }}
                showsPlaceholder={false}
                priority="low"
              />
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.title ?? `#${item.movie_id}`}
                </Text>
                <RatingRow
                  movieId={item.movie_id}
                  contentType={item.movie_type ?? "movie"}
                  ratingsMap={ratingsMap}
                  user={user}
                />
              </View>
            </Pressable>
            <View style={styles.rowActions}>
              <IconButton
                icon="star-minus"
                iconColor={colors.placeholder}
                size={16}
                onPress={() => removeSuperLike(item.movie_id, item.movie_type)}
              />
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140, paddingHorizontal: spacing.lg }}
        ListHeaderComponent={<View style={styles.listHeader}>{banner}</View>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon source="star-outline" size={44} color="rgba(255,255,255,0.07)" />
            <Text style={styles.emptyText}>{t("overview.empty-title") as string}</Text>
          </View>
        }
      />
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.appBackground },

  listHeader: { paddingTop: spacing.xxl * 3 + spacing.lg, paddingBottom: spacing.lg },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowInfo: { flex: 1, gap: spacing.xs },
  rowTitle: {
    fontSize: fontSize.lg,
    fontFamily: "Bebas",
    color: colors.text,
    letterSpacing: 0.5,
  },

  reviewPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    backgroundColor: colors.overlay,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xs,
  },
  reviewContent: { flex: 1, gap: spacing.xs - 2 },
  starRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingNum: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: "#FFD700",
    marginLeft: spacing.xs,
  },
  reviewText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.45)",
    lineHeight: fontSize.sm + 4,
  },
  noReviewText: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.25)",
    fontStyle: "italic",
  },

  rowActions: {
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.xs,
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },

  empty: { alignItems: "center", gap: spacing.sm + 2, paddingTop: spacing.xxl * 3 },
  emptyText: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
    color: "rgba(255,255,255,0.25)",
  },

  // non-auth tile path
  footer: { flex: 1, justifyContent: "flex-end", marginTop: spacing.xs + 1 },
  button: { marginTop: spacing.sm, borderColor: "#FFD700" },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: "#FFD700",
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  bannerIcon: { marginRight: spacing.sm + 2, marginTop: spacing.xs - 3 },
  bannerText: { flex: 1, fontSize: fontSize.md - 1, lineHeight: 19, color: "rgba(255, 255, 255, 0.75)" },
});
