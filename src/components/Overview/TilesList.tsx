import { useNavigation } from "@react-navigation/native";
import { FlatListProps, View } from "react-native";
import { Button, Text } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";
import { Movie } from "../../../types";
import { useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import CreateCollectionFromLiked from "../CreateCollectionFromLiked";
import MatchTile from "./MatchTile";

interface TileListProps
  extends Omit<
    FlatListProps<Movie>,
    "data" | "renderItem" | "keyExtractor" | "ListEmptyComponent" | "ListHeaderComponent" | "numColumns" | "initialNumToRender"
  > {
  data: any[];

  label: string;

  useMovieType?: boolean;

  onLongItemPress?: (item: Movie) => void;
}

export default function TilesList<T>({ data, label, onLongItemPress, useMovieType, ...rest }: TileListProps) {
  const type = useAppSelector((state) => state.room.room.type);

  const navigation = useNavigation<any>();
  const t = useTranslation();

  return (
    <>
      <Animated.FlatList
        {...rest}
        numColumns={3}
        contentContainerStyle={[rest.contentContainerStyle, { gap: 15 }]}
        ListHeaderComponent={
          label ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 35, marginBottom: 15, fontFamily: "Bebas", maxWidth: "70%" }}>{label}</Text>

              <CreateCollectionFromLiked data={data} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400, paddingHorizontal: 30 }}>
            <Text style={{ fontSize: 28, fontFamily: "Bebas", marginBottom: 15, textAlign: "center" }}>{t("overview.empty-title")}</Text>
            <Text style={{ fontSize: 14, opacity: 0.7, marginBottom: 25, textAlign: "center", lineHeight: 20 }}>{t("overview.empty")}</Text>
            <Button mode="text" onPress={() => navigation.goBack()} compact>
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
            navigation={navigation}
            index={index}
            onLongPress={onLongItemPress}
          />
        )}
      />
    </>
  );
}
