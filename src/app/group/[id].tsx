import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import SearchField from "../../components/SearchField";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useIsPreview } from "expo-router";
import * as Haptics from "expo-haptics";
import Icon from "../../components/Icon";
import IconButton from "../../components/IconButton";
import Text from "../../components/Text";
import AvatarText from "../../components/AvatarText";
import PageHeading from "../../components/PageHeading";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import PlatformBlurView from "../../components/PlatformBlurView";
import GroupScreenLayout from "../../components/Group/GroupScreenLayout";
import OverviewModal from "../../screens/Overview/Modal";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import { colors, common, fontSize, fontWeight, radius, spacing } from "../../constants/design";
import { useGroupData, type GroupMovie } from "../../hooks/useGroupData";
import useTranslation from "../../service/useTranslation";
import { useAppSelector } from "../../redux/store";
import { getUserAvatarColor, getInitials } from "../../utils/avatar";

const POSTER_W = 42;
const POSTER_H = 62;

export default function Group() {
  const { data, isListLoading, isRemote, handleRemoveItem, itemIdMap, listType } = useGroupData();
  const isPreview = useIsPreview();
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const user = useAppSelector((s) => s.auth.user);

  const [match, setMatch] = useState<GroupMovie | undefined>(undefined);
  const [search, setSearch] = useState("");

  const movies = data?.movies ?? [];
  const fortuneMovies = movies.map((m) => ({ ...m, poster_path: m.imageUrl }));

  const filteredMovies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return movies;
    return movies.filter((m) => m.title?.toLowerCase().includes(q));
  }, [movies, search]);

  const openManageSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/group/manage",
      params: { id: data?.id ?? "", name: data?.name ?? "", listType: listType ?? "" },
    } as any);
  };

  const openRateSheet = (item: GroupMovie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const remoteItemId = isRemote ? itemIdMap.get(item.id) : undefined;
    router.push({
      pathname: "/rate-movie",
      params: {
        movieId: String(item.id),
        contentType: item.type ?? "movie",
        groupId: data?.id ?? "",
        rating: item.rating != null ? String(item.rating) : "",
        review: item.review ?? "",
        ...(remoteItemId ? { itemId: remoteItemId, listType: listType ?? "" } : {}),
      },
    });
  };

  const renderFooter = (item: GroupMovie) => (
    <View style={styles.footer}>
      {!!item.review && (
        <Text style={styles.footerReview} numberOfLines={1}>{item.review}</Text>
      )}
    </View>
  );

  const renderRemoteRow = ({ item }: { item: GroupMovie }) => (
    <View style={styles.row}>
      <Pressable
        style={styles.rowMain}
        onPress={() =>
          router.push({
            pathname: "/movie/type/[type]/[id]",
            params: { type: item.type ?? "movie", id: String(item.id), img: item.imageUrl },
          } as any)
        }
        onLongPress={() => handleRemoveItem(item.id)}
      >
        <Thumbnail
          path={item.imageUrl}
          size={ThumbnailSizes.poster.small}
          container={{
            width: POSTER_W,
            height: POSTER_H,
            borderRadius: radius.xs + 2,
          }}
          showsPlaceholder={false}
          priority="low"
        />
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title ?? `#${item.id}`}
          </Text>
          <Pressable onPress={() => openRateSheet(item)} style={styles.reviewPressable}>
            <AvatarText
              label={getInitials(user?.name ?? "?")}
              size={22}
              style={{ backgroundColor: getUserAvatarColor(user?.name ?? "") }}
            />
            <View style={styles.reviewContent}>
              <View style={styles.starRow}>
                {Array.from({ length: 10 }, (_, i) => (
                  <Icon
                    key={i}
                    source={item.rating != null && i < item.rating ? "star" : "star-outline"}
                    size={10}
                    color={item.rating != null && i < item.rating ? "#FFD700" : colors.border}
                  />
                ))}
                {item.rating != null && (
                  <Text style={styles.ratingNum}>{item.rating}/10</Text>
                )}
              </View>
              {item.review ? (
                <Text style={styles.reviewText} numberOfLines={1}>{item.review}</Text>
              ) : (
                <Text style={styles.noReviewText}>{t("lists.noReview") as string}</Text>
              )}
            </View>
            <Icon source="pencil-outline" size={10} color="rgba(255,255,255,0.2)" />
          </Pressable>
        </View>
      </Pressable>
      <View style={styles.rowActions}>
        <IconButton
          icon="trash-can-outline"
          iconColor={colors.error}
          size={16}
          onPress={() => handleRemoveItem(item.id)}
        />
      </View>
    </View>
  );

  return (
    <>
      {isRemote ? (
        <SafeIOSContainer style={styles.container}>
          <PageHeading
            title={data?.name ?? ""}
            showBackButton={!isPreview}
          >
            <PlatformBlurView interactive style={styles.headerActions}>
              <IconButton
                icon="plus"
                size={28}
                style={common.iconButton}
                iconColor={colors.text}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/movie-picker",
                    params: { targetListType: listType ?? "", targetListName: data?.name ?? "" },
                  } as any);
                }}
              />
              <IconButton
                icon="cog-outline"
                size={28}
                style={common.iconButton}
                iconColor={colors.text}
                onPress={openManageSheet}
              />
            </PlatformBlurView>
          </PageHeading>
          <FlatList
            data={filteredMovies}
            keyExtractor={(item) => `${item.type}_${item.id}`}
            renderItem={renderRemoteRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 140,
              paddingHorizontal: spacing.lg,
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              <View>
                <SearchField
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t("manage-group.searchPlaceholder") as string}
                  returnKeyType="search"
                  style={styles.searchInput}
                />
                {movies.length > 0 && (
                  <Text style={styles.countLabel}>
                    {t("lists.items", {
                      count: filteredMovies.length,
                      plural: filteredMovies.length === 1 ? "" : "s",
                    }) as string}
                  </Text>
                )}
              </View>
            }
            ListEmptyComponent={
              isListLoading ? (
                <View style={styles.empty}>
                  <Icon source="loading" size={28} color="rgba(255,255,255,0.2)" />
                </View>
              ) : (
                <View style={styles.empty}>
                  <Icon source="movie-open-outline" size={44} color="rgba(255,255,255,0.07)" />
                  <Text style={styles.emptyText}>{t("lists.empty") as string}</Text>
                </View>
              )
            }
          />
        </SafeIOSContainer>
      ) : (
        <GroupScreenLayout
          title={data?.name ?? ""}
          data={fortuneMovies}
          isLoading={false}
          showHeading={!isPreview}
          renderItemFooter={(item) => renderFooter(item as GroupMovie)}
          onLongItemPress={(item) => handleRemoveItem(item.id)}
        />
      )}

      {match && (
        <OverviewModal
          styles={{ paddingTop: spacing.xxl * 2 + 2 }}
          onClose={() => setMatch(undefined)}
          match={{ ...match, poster_path: match.imageUrl }}
        />
      )}
      <MoviesActionButtons
        match={!!match}
        fortuneWheelMovies={fortuneMovies}
        fortuneWheelTitle={data?.name ?? ""}
        onScratchCardPress={() => {
          if (match) return setMatch(undefined);
          setMatch(movies[Math.floor(Math.random() * movies.length)]);
        }}
        containerStyle={{ bottom: insets.bottom }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.appBackground },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    overflow: "hidden",
  },

  searchInput: {
    marginTop: spacing.xxl * 3,
  },

  countLabel: {
    fontSize: fontSize.sm - 1,
    color: "rgba(255,255,255,0.25)",
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  footer: {
    marginTop: spacing.sm,
  },
  footerReview: {
    fontSize: fontSize.xs,
    color: "#888",
    marginTop: spacing.xs,
    marginLeft: spacing.xs - 2,
  },

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
  rowActions: {
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.xs,
  },

  starRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingNum: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: "#FFD700",
    marginLeft: spacing.xs,
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
  reviewContent: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  reviewText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.45)",
    lineHeight: fontSize.sm + 4,
  },
  noReviewText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.25)",
    fontStyle: "italic",
    lineHeight: fontSize.sm + 4,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  empty: { alignItems: "center", paddingTop: spacing.xxl * 3 },
  emptyText: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
    color: "rgba(255,255,255,0.25)",
    marginTop: spacing.sm + 2,
  },
});
