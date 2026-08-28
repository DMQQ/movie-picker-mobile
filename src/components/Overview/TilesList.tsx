import type { ReactNode } from "react";
import Text from "../Text";
import { FlatList, FlatListProps, StyleSheet, View } from "react-native";

import Button from "../Button";
import IconButton from "../IconButton";
import MovieRow from "../MovieRow";
import { Movie } from "../../../types";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import CreateCollectionFromLiked from "../CreateCollectionFromLiked";
import MatchTile from "./MatchTile";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, fontSize, spacing, typography } from "../../constants/design";
import { addToGroup, removeFromGroup } from "../../redux/favourites/favourites";

interface TileListProps
  extends Omit<
    FlatListProps<Movie>,
    "data" | "renderItem" | "keyExtractor" | "ListEmptyComponent" | "ListHeaderComponent" | "numColumns" | "initialNumToRender"
  > {
  data: any[];

  label: string;

  layout?: "grid" | "column";

  useMovieType?: boolean;

  onLongItemPress?: (item: Movie) => void;

  renderItemFooter?: (movie: Movie) => ReactNode;

  subheader?: ReactNode;
}

function ColumnRow({ item, type, onLongPress, renderFooter }: { item: Movie; type: string; onLongPress?: (item: Movie) => void; renderFooter?: (m: Movie) => ReactNode }) {
  const dispatch = useAppDispatch();
  const membershipIndex = useAppSelector((s) => s.favourite.membershipIndex);

  const resolvedType = (item.type || type).includes("movie") ? "movie" : "tv";
  const title = item.title || item.name || `#${item.id}`;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);

  const inWatchlist = !!membershipIndex["2"]?.[`${item.id}:${resolvedType}`];

  const toggleWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (inWatchlist) {
      dispatch(removeFromGroup({ groupId: "2", movieId: item.id }));
    } else {
      dispatch(addToGroup({
        groupId: "2",
        item: { id: item.id, imageUrl: item.poster_path, type: resolvedType as any, title },
      }));
    }
  };

  return (
    <MovieRow
      id={item.id}
      title={title}
      posterPath={item.poster_path}
      type={resolvedType}
      year={year}
      score={item.vote_average > 0 ? item.vote_average : undefined}
      onLongPress={() => onLongPress?.(item)}
      trailing={
        <IconButton
          icon={inWatchlist ? "clock" : "clock-outline"}
          size={18}
          iconColor={inWatchlist ? colors.primary : "rgba(255,255,255,0.35)"}
          onPress={toggleWatchlist}
        />
      }
    >
      {renderFooter?.(item)}
    </MovieRow>
  );
}

export default function TilesList<T>({ data, label, layout = "grid", onLongItemPress, useMovieType, renderItemFooter, subheader, ...rest }: TileListProps) {
  const type = useAppSelector((state) => state.room.type);
  const t = useTranslation();

  const isColumn = layout === "column";

  const header =
    subheader || label ? (
      <>
        {subheader}
        {label ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: typography.bebasSize.section, marginBottom: spacing.screen, fontFamily: "Bebas", maxWidth: "70%" }}>{label}</Text>
            <CreateCollectionFromLiked data={data} />
          </View>
        ) : null}
      </>
    ) : null;

  const empty = (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400, paddingHorizontal: spacing.xxl + 6 }}>
      <Text style={{ fontSize: 28, fontFamily: "Bebas", marginBottom: spacing.screen, textAlign: "center" }}>{t("overview.empty-title")}</Text>
      <Text style={{ fontSize: fontSize.md, opacity: 0.7, marginBottom: spacing.xxl + 1, textAlign: "center", lineHeight: 20 }}>{t("overview.empty")}</Text>
      <Button mode="text" onPress={() => router.back()} compact>
        {t("overview.back-to-game")}
      </Button>
    </View>
  );

  if (isColumn) {
    return (
      <FlatList
        {...rest}
        showsVerticalScrollIndicator={false}
        style={[{ flex: 1 }, rest.style]}
        contentContainerStyle={[rest.contentContainerStyle, { paddingBottom: spacing.xl * 3 }]}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        data={data}
        keyExtractor={(match: Movie) => match.type + "_" + match.id.toString()}
        initialNumToRender={20}
        renderItem={({ item }) => (
          <ColumnRow
            item={item}
            type={useMovieType ? item.type || (item?.name ? "tv" : "movie") : type}
            onLongPress={onLongItemPress}
            renderFooter={renderItemFooter}
          />
        )}
      />
    );
  }

  return (
    <FlatList
      {...rest}
      showsVerticalScrollIndicator={false}
      style={[{ flex: 1 }, rest.style]}
      numColumns={3}
      contentContainerStyle={[rest.contentContainerStyle, { gap: spacing.screen, paddingBottom: spacing.xl * 3 }]}
      columnWrapperStyle={{ gap: spacing.screen }}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      data={data}
      keyExtractor={(match: Movie) => match.type + "_" + match.id.toString()}
      initialNumToRender={12}
      renderItem={({ item: match, index }) => (
        <MatchTile
          posterSize={data?.length % 3 !== 0 && index === data.length - 1 ? 780 : data?.length % 2 !== 0 ? 500 : 200}
          match={match}
          type={useMovieType ? match.type || (match?.name ? "tv" : "movie") : type}
          index={index}
          onLongPress={onLongItemPress}
          renderFooter={renderItemFooter}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
