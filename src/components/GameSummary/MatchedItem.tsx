import { StyleSheet, View } from "react-native";
import Text from "../Text";

import Button from "../Button";
import { colors, fontSize, fontWeight, spacing } from "../../constants/design";
import { Movie } from "../../../types";
import MatchTile from "../Overview/MatchTile";
import { addToGroup, removeFromGroup } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import Badge from "./Badge";

interface Props extends Partial<Movie> {
  summary: { type: string };
  badge?: boolean;
}

export default function MatchedItem({ summary, badge = false, ...item }: Props) {
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.favourite.groups);
  const t = useTranslation();

  const isInGroup1 =
    groups.find((g) => g?.id === "1")?.movies.some((m) => m?.id === item?.id) ?? false;

  const onFavouritePress = () => {
    isInGroup1
      ? dispatch(removeFromGroup({ groupId: "1", movieId: item.id! }))
      : dispatch(
          addToGroup({
            item: { id: item.id!, imageUrl: item.poster_path!, type: item.type as "movie" | "tv", title: item.title || item.name },
            groupId: "1",
          }),
        );
  };

  return (
    <MatchTile
      match={item as Movie}
      type={summary.type}
      index={0}
      disabled={!item.id}
      badge={badge ? <Badge /> : undefined}
      renderFooter={(movie) => (
        <View style={styles.footer}>
          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>
          <Button
            style={{
              marginTop: spacing.sm,
              borderColor: isInGroup1 ? colors.error : colors.primary,
            }}
            mode="outlined"
            onPress={onFavouritePress}
            textColor={isInGroup1 ? colors.error : colors.primary}
          >
            {isInGroup1 ? t("game-summary.remove-from-favourites") : t("game-summary.add-to-favourites")}
          </Button>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  footer: { flex: 1, justifyContent: "space-between", marginTop: spacing.xs + 1 },
  title: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});
