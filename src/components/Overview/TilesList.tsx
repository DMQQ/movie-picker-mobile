import { Alert, Platform, Pressable, View } from "react-native";
import { IconButton, MD2DarkTheme, Text } from "react-native-paper";
import Animated from "react-native-reanimated";
import MatchTile from "./MatchTile";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useNavigation } from "@react-navigation/native";
import FrostedGlass from "../FrostedGlass";
import Ant from "react-native-vector-icons/AntDesign";
import { createGroupFromArray } from "../../redux/favourites/favourites";
import { hexToRgba } from "../../utils/hexToRgb";

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

  const dispatch = useAppDispatch();

  return (
    <Animated.FlatList
      numColumns={3}
      ListHeaderComponent={
        props.label ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 35, marginBottom: 15, fontFamily: "Bebas" }}>{props.label}</Text>

            <Pressable
              onPress={() => {
                Alert.prompt("Create Collection", "Enter a name for your new collection:", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Create",
                    onPress: (name) => {
                      if (name && props.data.length > 0) {
                        dispatch(
                          createGroupFromArray({
                            movies: props.data,
                            name,
                          })
                        );
                      }
                    },
                  },
                ]);
              }}
            >
              <FrostedGlass
                container={{ borderRadius: 100, backgroundColor: hexToRgba(MD2DarkTheme.colors.primary, 0.75) }}
                style={{ padding: 10, borderRadius: 100 }}
              >
                <Ant name="star" color={"#fff"} size={20} />
              </FrostedGlass>
            </Pressable>
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
