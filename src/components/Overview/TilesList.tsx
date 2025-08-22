import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { Button, Dialog, MD2DarkTheme, Text, TextInput } from "react-native-paper";
import Animated, { LinearTransition } from "react-native-reanimated";
import Ant from "react-native-vector-icons/AntDesign";
import { Movie } from "../../../types";
import { createGroupFromArray } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import { hexToRgba } from "../../utils/hexToRgb";
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

  const dispatch = useAppDispatch();
  const t = useTranslation();

  const [isModalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState("");

  return (
    <>
      <Animated.FlatList
        numColumns={3}
        layout={LinearTransition}
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
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400, paddingHorizontal: 30 }}>
            <Text style={{ fontSize: 28, fontFamily: "Bebas", marginBottom: 15, textAlign: "center" }}>{t("overview.empty-title")}</Text>
            <Text style={{ fontSize: 14, opacity: 0.7, marginBottom: 25, textAlign: "center", lineHeight: 20 }}>{t("overview.empty")}</Text>
            <Button 
              mode="text" 
              onPress={() => navigation.goBack()}
              compact
            >
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
