import { Platform, View } from "react-native";
import { Text } from "react-native-paper";
import Animated from "react-native-reanimated";
import MatchTile from "./MatchTile";
import { useAppSelector } from "../../redux/store";
import { useNavigation } from "@react-navigation/native";

interface TileListProps {
  data: any[];

  label: string;

  useMovieType?: boolean;
}

export default function TilesList<T>(props: TileListProps) {
  const {
    room: { type },
  } = useAppSelector((state) => state.room);

  const navigation = useNavigation<any>();

  return (
    <Animated.FlatList
      numColumns={3}
      ListHeaderComponent={
        props.label ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 35, marginBottom: 15, fontFamily: "Bebas" }}>{props.label}</Text>
          </View>
        ) : null
      }
      data={props.data}
      keyExtractor={(match) => match.id.toString()}
      initialNumToRender={6}
      renderItem={({ item: match, index }) => (
        <MatchTile
          posterSize={props.data?.length % 3 !== 0 && index === props.data.length - 1 ? 780 : props?.data?.length % 2 !== 0 ? 500 : 200}
          match={match}
          type={props.useMovieType ? match.type || (match?.name ? "tv" : "movie") : type}
          navigation={navigation}
          index={index}
        />
      )}
    />
  );
}
