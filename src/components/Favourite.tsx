import { Fragment, useState } from "react";
import { View, TouchableOpacity, Modal, Text, StyleSheet, Platform } from "react-native";
import { IconButton, MD2DarkTheme, Portal } from "react-native-paper";
import { Movie } from "../../types";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { addToGroup, removeFromGroup } from "../redux/favourites/favourites";
import * as Haptics from "expo-haptics";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === "android") return <Portal>{children}</Portal>;

  return <Fragment>{children}</Fragment>;
};

export default function CustomFavourite({ movie }: { movie: Movie }) {
  const dispatch = useAppDispatch<any>();
  const favourites = useAppSelector((state) => state.favourite);
  const [visible, setVisible] = useState(false);

  const isFavorite = favourites?.groups.some((group) => group.movies.some((m) => m.id === movie.id));

  const onPress = (group: (typeof favourites.groups)[number]) => {
    group.movies.find((m) => m.id === movie.id)
      ? dispatch(
          removeFromGroup({
            groupId: group.id,
            movieId: movie.id,
          })
        )
      : dispatch(
          addToGroup({
            item: {
              id: movie.id,
              imageUrl: movie.poster_path,
              type: movie.type || (movie?.title !== undefined ? "movie" : "tv"),
            },
            groupId: group.id,
          })
        );

    setTimeout(() => setVisible(false), 500);
  };

  return (
    <View>
      <IconButton
        icon={isFavorite ? "heart" : "heart-outline"}
        iconColor={isFavorite ? "red" : "white"}
        size={30}
        onPress={() => setVisible(true)}
      />

      <Wrapper>
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
          <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
            <View style={styles.dropdown}>
              <Text
                style={{
                  color: MD2DarkTheme.colors.text,
                  fontSize: 25,
                  fontFamily: "Bebas",
                  marginBottom: 20,
                }}
              >
                Choose a group to add{" "}
                <Text style={{ fontWeight: "bold", color: MD2DarkTheme.colors.primary }}>{movie.title || movie.name}</Text> to:
              </Text>
              {favourites.groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.item,
                    {
                      backgroundColor: group.movies.find((m) => m.id === movie.id)
                        ? MD2DarkTheme.colors.primary
                        : MD2DarkTheme.colors.background,
                    },
                  ]}
                  onPress={() => {
                    onPress(group);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.itemText}>{group.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </Wrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "#000",
    borderRadius: 15,
    padding: 25,
    width: "80%",
  },
  item: {
    borderRadius: 10,
    marginTop: 10,
    padding: 15,
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center",
    backgroundColor: MD2DarkTheme.colors.surface,
  },
  itemText: {
    fontSize: 16,
    color: MD2DarkTheme.colors.text,
  },
});
