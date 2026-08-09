import type { ReactNode } from "react";
import Text from "../Text";
import { FlatList, FlatListProps, View } from "react-native";

import Button from "../Button";
import { Movie } from "../../../types";
import { useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import CreateCollectionFromLiked from "../CreateCollectionFromLiked";
import MatchTile from "./MatchTile";
import { router } from "expo-router";
import { fontSize, spacing, typography } from "../../constants/design";

interface TileListProps
  extends Omit<
    FlatListProps<Movie>,
    "data" | "renderItem" | "keyExtractor" | "ListEmptyComponent" | "ListHeaderComponent" | "numColumns" | "initialNumToRender"
  > {
  data: any[];

  label: string;

  useMovieType?: boolean;

  onLongItemPress?: (item: Movie) => void;

  renderItemFooter?: (movie: Movie) => ReactNode;

  subheader?: ReactNode;
}

export default function TilesList<T>({ data, label, onLongItemPress, useMovieType, renderItemFooter, subheader, ...rest }: TileListProps) {
  const type = useAppSelector((state) => state.room.type);
  const t = useTranslation();

  return (
    <>
      <FlatList
        {...rest}
        style={[{ flex: 1 }, rest.style]}
        numColumns={3}
        contentContainerStyle={[rest.contentContainerStyle, { gap: spacing.screen, paddingBottom: spacing.xl * 3 }]}
        columnWrapperStyle={{ gap: spacing.screen }}
        ListHeaderComponent={
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
          ) : null
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400, paddingHorizontal: spacing.xxl + 6 }}>
            <Text style={{ fontSize: 28, fontFamily: "Bebas", marginBottom: spacing.screen, textAlign: "center" }}>{t("overview.empty-title")}</Text>
            <Text style={{ fontSize: fontSize.md, opacity: 0.7, marginBottom: spacing.xxl + 1, textAlign: "center", lineHeight: 20 }}>{t("overview.empty")}</Text>
            <Button mode="text" onPress={() => router.back()} compact>
              {t("overview.back-to-game")}
            </Button>
          </View>
        }
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
    </>
  );
}
