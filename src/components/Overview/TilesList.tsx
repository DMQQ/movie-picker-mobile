import { View } from "react-native";
import { Text } from "react-native-paper";
import Animated from "react-native-reanimated";
import MatchTile from "./MatchTile";
import { useAppSelector } from "../../redux/store";
import { useNavigation } from "@react-navigation/native";

interface TileListProps {
  data: any[];

  label: string;
}

export default function TilesList<T>(props: TileListProps) {
  const {
    room: { type },
  } = useAppSelector((state) => state.room);

  const navigation = useNavigation<any>();

  return (
    <Animated.FlatList
      numColumns={2}
      style={{ marginBottom: 50 }}
      ListHeaderComponent={
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: "400" }}>
            {props.label}
          </Text>
          <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: "400" }}>
            ({props.data.length})
          </Text>
        </View>
      }
      data={props.data}
      keyExtractor={(match) => match.id.toString()}
      initialNumToRender={6}
      renderItem={({ item: match, index }) => (
        <MatchTile
          match={match}
          type={type}
          navigation={navigation}
          index={index}
        />
      )}
    />
  );
}
