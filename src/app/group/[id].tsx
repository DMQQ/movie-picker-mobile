import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useIsPreview } from "expo-router";
import * as Haptics from "expo-haptics";
import Icon from "../../components/Icon";
import IconButton from "../../components/IconButton";
import Text from "../../components/Text";
import PageHeading from "../../components/PageHeading";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import GroupScreenLayout from "../../components/Group/GroupScreenLayout";
import OverviewModal from "../../screens/Overview/Modal";
import ShareSelectionModal from "../../components/Group/ShareSelectionModal";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import { colors, fontSize, fontWeight, radius, spacing } from "../../constants/design";
import { useGroupData, type GroupMovie } from "../../hooks/useGroupData";

const POSTER_W = 42;
const POSTER_H = 62;

export default function Group() {
  const { data, isListLoading, isRemote, handleRemoveItem, itemIdMap, listType } = useGroupData();
  const isPreview = useIsPreview();
  const insets = useSafeAreaInsets();

  const [match, setMatch] = useState<GroupMovie | undefined>(undefined);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const movies = data?.movies ?? [];
  const fortuneMovies = movies.map((m) => ({ ...m, poster_path: m.imageUrl }));

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
      <View style={styles.footerRow}>
        <IconButton
          icon="trash-can-outline"
          iconColor={colors.error}
          size={18}
          onPress={() => handleRemoveItem(item.id)}
          style={styles.trashButton}
        />
      </View>
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
            <Text style={styles.reviewText} numberOfLines={2}>
              {item.review}
            </Text>
          ) : (
            <Text style={styles.noReviewText}>No review</Text>
          )}
        </View>
      </Pressable>
      <View style={styles.rowActions}>
        <IconButton
          icon={item.rating != null ? "star" : "star-outline"}
          iconColor={item.rating != null ? "#FFD700" : colors.placeholder}
          size={16}
          onPress={() => openRateSheet(item)}
        />
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
            showRightIconButton={movies.length > 0}
            rightIconName="share-outline"
            onRightIconPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShareModalVisible(true);
            }}
          />
          <FlatList
            data={movies}
            keyExtractor={(item) => `${item.type}_${item.id}`}
            renderItem={renderRemoteRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 140,
              paddingHorizontal: spacing.lg,
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              movies.length > 0 ? (
                <Text style={styles.countLabel}>
                  {movies.length} {movies.length === 1 ? "item" : "items"}
                </Text>
              ) : null
            }
            ListEmptyComponent={
              isListLoading ? (
                <View style={styles.empty}>
                  <Icon source="loading" size={28} color="rgba(255,255,255,0.2)" />
                </View>
              ) : null
            }
          />
        </SafeIOSContainer>
      ) : (
        <GroupScreenLayout
          title={data?.name ?? ""}
          data={fortuneMovies}
          isLoading={false}
          showHeading={!isPreview}
          showRightIconButton={movies.length > 0}
          rightIconName="share-outline"
          onRightIconPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShareModalVisible(true);
          }}
          renderItemFooter={(item) => renderFooter(item as GroupMovie)}
        />
      )}

      {match && (
        <OverviewModal
          styles={{ paddingTop: spacing.xxl * 2 + 2 }}
          onClose={() => setMatch(undefined)}
          match={{ ...match, poster_path: match.imageUrl }}
        />
      )}
      <ShareSelectionModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        movies={movies}
      />
      <MoviesActionButtons
        match={!!match}
        fortuneWheelMovies={fortuneMovies}
        fortuneWheelTitle={data?.name ?? ""}
        onScratchCardPress={() => {
          if (match) return setMatch(undefined);
          setMatch(movies[Math.floor(Math.random() * movies.length)]);
        }}
        containerStyle={{ bottom: 30 }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.appBackground },

  countLabel: {
    fontSize: fontSize.sm - 1,
    color: "rgba(255,255,255,0.25)",
    paddingTop: spacing.xxl * 3,
    paddingBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  footer: {
    marginTop: spacing.sm,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trashButton: {
    margin: 0,
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

  reviewText: {
    fontSize: fontSize.sm + 1,
    color: "rgba(255,255,255,0.45)",
    lineHeight: fontSize.sm + 6,
  },
  noReviewText: {
    fontSize: fontSize.sm + 1,
    color: "rgba(255,255,255,0.25)",
    fontStyle: "italic",
    lineHeight: fontSize.sm + 6,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  empty: { alignItems: "center", paddingTop: spacing.xxl * 3 },
});
