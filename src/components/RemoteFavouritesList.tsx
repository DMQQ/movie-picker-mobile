import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "./Text";
import { ReactNode, useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ImageBackground } from "expo-image";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { colors, fontSize, radius, spacing } from "../constants/design";
import { Link, router } from "expo-router";
import { useGetListsQuery, type UserList } from "../redux/lists/listsApi";
import {
  INTERACTION_LIST_TYPES,
  TYPE_TO_LOCAL_ID,
} from "../redux/favourites/favourites";
import { useBlockedMovies } from "../hooks/useBlockedMovies";
import { useSuperLikedMovies } from "../hooks/useSuperLikedMovies";
import Thumbnail from "./Thumbnail";
import useTranslation from "../service/useTranslation";
import { TourAttachStep } from "./Tour/TourAttachStep";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

const CARD_HEIGHT = WINDOW_WIDTH / 2 - 30;

function toGroupParams(list: UserList) {
  return {
    id: TYPE_TO_LOCAL_ID[list.type] ?? list.id,
    group: JSON.stringify({
      id: TYPE_TO_LOCAL_ID[list.type] ?? list.id,
      type: list.type,
      name: list.name,
      posterPath: list.posterPath ?? undefined,
      movies: (list.previewItems ?? []).map((p) => ({
        id: p.contentId,
        imageUrl: p.posterPath || "",
        type: p.contentType,
      })),
    }),
  };
}

function GroupCard({ item }: { item: UserList }) {
  const t = useTranslation();
  const previewItems = item.previewItems ?? [];
  const isEmpty = item.itemCount === 0;
  const backgroundUri = previewItems[0]?.posterPath
    ? "https://image.tmdb.org/t/p/w500" + previewItems[0].posterPath
    : undefined;

  return (
    <Link
      disabled={isEmpty}
      style={{ marginBottom: spacing.screen }}
      href={{ pathname: "/group/[id]", params: toGroupParams(item) }}
    >
      <Link.Trigger>
        <View
          style={{
            borderRadius: radius.sm + 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <ImageBackground
            blurRadius={20}
            style={styles.cardBg}
            source={backgroundUri ? { uri: backgroundUri } : undefined}
          >
            {isEmpty ? (
              <View style={styles.emptyInner}>
                <MaterialCommunityIcons
                  name="plus"
                  size={50}
                  color={colors.text}
                  style={{ opacity: 0.5 }}
                />
                <Text
                  style={{ fontSize: fontSize.sm - 1, textAlign: "center" }}
                >
                  {t("favourites.empty")}
                </Text>
              </View>
            ) : (
              <View style={styles.thumbnailGrid}>
                {previewItems.slice(0, 4).map((p) => (
                  <Thumbnail
                    key={p.contentId}
                    path={p.posterPath || ""}
                    size={200}
                    container={styles.thumbnail}
                  />
                ))}
              </View>
            )}
          </ImageBackground>
          <View style={styles.labelRow}>
            <Text style={[styles.labelText, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={styles.countText}>({item.itemCount})</Text>
          </View>
        </View>
      </Link.Trigger>
    </Link>
  );
}

function SpecialCardsFooter({ tourStepIndex }: { tourStepIndex?: number }) {
  const { superLikedMovies } = useSuperLikedMovies();
  const { blockedMovies } = useBlockedMovies();
  const t = useTranslation();

  const superLikedCard = (
    <Pressable onPress={() => router.push("/group/super-liked")}>
      <View
        style={{
          borderRadius: radius.sm + 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <ImageBackground
          blurRadius={20}
          style={styles.cardBg}
          source={
            superLikedMovies[0]
              ? {
                  uri:
                    "https://image.tmdb.org/t/p/w500" +
                    superLikedMovies[0].poster_path,
                }
              : undefined
          }
        >
          <View
            style={[
              styles.overlay,
              { backgroundColor: "rgba(255, 215, 0, 0.12)" },
            ]}
          />
          {superLikedMovies.length === 0 ? (
            <View style={styles.emptyInner}>
              <MaterialCommunityIcons
                name="star"
                size={50}
                color="#FFD700"
                style={{ opacity: 0.5 }}
              />
            </View>
          ) : (
            <View style={styles.thumbnailGrid}>
              {superLikedMovies.slice(0, 4).map((m) => (
                <Thumbnail
                  key={m.movie_id}
                  path={m.poster_path || ""}
                  size={200}
                  container={styles.thumbnail}
                />
              ))}
            </View>
          )}
        </ImageBackground>
        <View style={styles.labelRow}>
          <Text style={[styles.labelText, { color: "#FFD700" }]}>
            {t("super-liked.title")}
          </Text>
          <Text style={styles.countText}>({superLikedMovies.length})</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={{ gap: spacing.screen }}>
      {tourStepIndex !== undefined ? (
        <TourAttachStep index={tourStepIndex}>{superLikedCard}</TourAttachStep>
      ) : (
        superLikedCard
      )}

      <Pressable onPress={() => router.push("/group/blocked")}>
        <View
          style={{
            borderRadius: radius.sm + 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <ImageBackground
            blurRadius={20}
            style={styles.cardBg}
            source={
              blockedMovies[0]
                ? {
                    uri:
                      "https://image.tmdb.org/t/p/w500" +
                      blockedMovies[0].poster_path,
                  }
                : undefined
            }
          >
            <View
              style={[
                styles.overlay,
                { backgroundColor: "rgba(255, 68, 88, 0.12)" },
              ]}
            />
            {blockedMovies.length === 0 ? (
              <View style={styles.emptyInner}>
                <MaterialCommunityIcons
                  name="cancel"
                  size={50}
                  color="#FF4458"
                  style={{ opacity: 0.5 }}
                />
              </View>
            ) : (
              <View style={styles.thumbnailGrid}>
                {blockedMovies.slice(0, 4).map((m) => (
                  <Thumbnail
                    key={m.movie_id}
                    path={m.poster_path || ""}
                    size={200}
                    container={styles.thumbnail}
                  />
                ))}
              </View>
            )}
          </ImageBackground>
          <View style={styles.labelRow}>
            <Text style={[styles.labelText, { color: "#FF4458" }]}>
              {t("blocked.title")}
            </Text>
            <Text style={styles.countText}>({blockedMovies.length})</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

type Props = {
  listHeader?: ReactNode;
  listRef?: React.RefObject<FlatList | null>;
  tourStepIndex?: number;
  topPadding?: number;
};

export default function RemoteFavouritesList({
  listHeader,
  listRef,
  tourStepIndex,
  topPadding = spacing.xl * 4,
}: Props) {
  const [page, setPage] = useState(1);

  const { data, isFetching, refetch } = useGetListsQuery({ page });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const groups = (data?.lists ?? []).filter(
    (l) => !INTERACTION_LIST_TYPES.has(l.type),
  );
  const hasMore = data ? data.lists.length < data.total : false;

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) setPage((p) => p + 1);
  }, [isFetching, hasMore]);

  return (
    <FlatList
      ref={listRef}
      showsVerticalScrollIndicator={false}
      data={groups}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingTop: topPadding,
        paddingBottom: spacing.xl * 5,
      }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={listHeader ? <>{listHeader}</> : null}
      ListFooterComponent={<SpecialCardsFooter tourStepIndex={tourStepIndex} />}
      renderItem={({ item }) => <GroupCard item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  cardBg: {
    width: WINDOW_WIDTH - 30,
    height: CARD_HEIGHT,
    borderRadius: radius.md + 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingBottom: spacing.xxl + 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emptyInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sm + 2,
  },
  thumbnailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  thumbnail: {
    width: (WINDOW_WIDTH / 2 - 25) * 0.45,
    height: (WINDOW_WIDTH / 2 - 25) * 0.65,
    borderRadius: radius.xs + 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 5,
    left: 15,
    gap: spacing.xs + 1,
  },
  labelText: {
    fontSize: 25,
    fontFamily: "Bebas",
  },
  countText: {
    fontSize: fontSize.md + 1,
  },
});
