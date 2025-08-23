import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { Button, MD2DarkTheme, Text } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";
import Ant from "react-native-vector-icons/AntDesign";
import { Movie } from "../../../types";
import { useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import { hexToRgba } from "../../utils/hexToRgb";
import CreateCollectionFromLiked from "../CreateCollectionFromLiked";
import FrostedGlass from "../FrostedGlass";
import MatchTile from "./MatchTile";

interface TileListProps {
  data: any[];

  label: string;

  useMovieType?: boolean;

  onLongItemPress?: (item: Movie) => void;
}

export default function TilesList<T>(props: TileListProps) {
  const {
    room: { type },
  } = useAppSelector((state) => state.room);

  const navigation = useNavigation<any>();
  const t = useTranslation();

  return (
    <>
      <Animated.FlatList
        numColumns={3}
        layout={LinearTransition}
        ListHeaderComponent={
          props.label ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 35, marginBottom: 15, fontFamily: "Bebas" }}>{props.label}</Text>

              <CreateCollectionFromLiked data={props.data}>
                <FrostedGlass
                  container={{ borderRadius: 100, backgroundColor: hexToRgba(MD2DarkTheme.colors.primary, 0.75) }}
                  style={{ paddingHorizontal: 15, padding: 7.5, borderRadius: 100, flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Ant name="star" color={"#fff"} size={20} />
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",

                      fontSize: 14,
                    }}
                  >
                    {t("overview.create-collection")}
                  </Text>
                </FrostedGlass>
              </CreateCollectionFromLiked>
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
        data={props.data}
        keyExtractor={(match: Movie) => match.type + "_" + match.id.toString()}
        initialNumToRender={12}
        renderItem={({ item: match, index }) => (
          <MatchTile
            posterSize={props.data?.length % 3 !== 0 && index === props.data.length - 1 ? 780 : props?.data?.length % 2 !== 0 ? 500 : 200}
            match={match}
            type={props.useMovieType ? match.type || (match?.name ? "tv" : "movie") : type}
            navigation={navigation}
            index={index}
            onLongPress={props.onLongItemPress}
          />
        )}
      />
    </>
  );
}
