import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { Button, Dialog, MD2DarkTheme, Text, TextInput } from "react-native-paper";
import Animated from "react-native-reanimated";
import Ant from "react-native-vector-icons/AntDesign";
import { createGroupFromArray } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { hexToRgba } from "../../utils/hexToRgb";
import FrostedGlass from "../FrostedGlass";
import MatchTile from "./MatchTile";

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

  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");

  return (
    <>
      <Animated.FlatList
        numColumns={3}
        ListHeaderComponent={
          props.label ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 35, marginBottom: 15, fontFamily: "Bebas" }}>{props.label}</Text>

              <Pressable
                onPress={() => {
                  setModalVisible(true);
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

      <Dialog
        dismissableBackButton
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
        style={{ backgroundColor: MD2DarkTheme.colors.surface }}
      >
        <Dialog.Title>Create Collection</Dialog.Title>
        <Dialog.Content>
          <TextInput
            onSubmitEditing={() => Keyboard.dismiss()}
            value={text}
            onChangeText={setText}
            label="Enter a name for your new collection"
            mode="outlined"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setModalVisible(false)}>Cancel</Button>
          <Button
            onPress={() => {
              if (text && props.data.length > 0) {
                dispatch(
                  createGroupFromArray({
                    movies: props.data,
                    name: text.trim(),
                  })
                );
                setModalVisible(false);
                setText("");
                navigation.navigate("Favourites");
              }
            }}
          >
            Create
          </Button>
        </Dialog.Actions>
      </Dialog>
    </>
  );
}
