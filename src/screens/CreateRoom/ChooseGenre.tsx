import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Button, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useCreateRoom } from "./ContextProvider";
import { url } from "../../service/SocketContext";

export default function ChooseGenre({ navigation }: any) {
  const { category, genre, setGenre: selectGenre } = useCreateRoom();
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetch(`${url}/movie/genres/${category.includes("tv") ? "tv" : "movie"}`)
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch((err) => console.log(JSON.stringify(err, null, 2)));
  }, [category]);

  const theme = useTheme();

  //  navigation.navigate("ChoosePage");

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <FlatList
        initialNumToRender={12}
        style={{ flex: 1, paddingBottom: 25 }}
        data={genres as { id: number; name: string }[]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GenreTile
            item={item}
            isIncluded={genre.some((g) => g.id === item.id)}
            selectGenre={selectGenre}
          />
        )}
      />

      <Button
        mode="contained"
        style={{
          borderRadius: 100,
          marginTop: 10,
        }}
        contentStyle={{ padding: 7.5 }}
        onPress={() => navigation.navigate("ChoosePage")}
      >
        Next
      </Button>
    </View>
  );
}

const GenreTile = ({
  item,
  isIncluded,
  selectGenre,
}: {
  item: { id: number; name: string };
  isIncluded: boolean;
  selectGenre: (val: any) => void;
}) => {
  const theme = useTheme();

  return (
    <TouchableRipple
      style={{
        backgroundColor: theme.colors.surface,
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            paddingHorizontal: 5,
          }}
        >
          {item.name}
        </Text>

        {
          // <Button
          //   mode="contained"
          //   buttonColor={isIncluded ? theme.colors.error : theme.colors.primary}
          //   style={{ borderRadius: 100 }}
          //   onPress={() => {
          //     if (isIncluded) {
          //       selectGenre((val: any) =>
          //         val.filter((g: any) => g.id !== item.id)
          //       );
          //     } else {
          //       selectGenre((val: any) => [...val, item]);
          //     }
          //   }}
          // >
          //   {isIncluded ? "Remove" : "Select"}
          // </Button>
          <TouchableRipple
            style={{ padding: 5 }}
            onPress={() => {
              if (isIncluded) {
                selectGenre((val: any) =>
                  val.filter((g: any) => g.id !== item.id)
                );
              } else {
                selectGenre((val: any) => [...val, item]);
              }
            }}
          >
            <Text
              style={{
                color: isIncluded ? theme.colors.error : theme.colors.primary,
                fontSize: 16,
                fontWeight: "600",
                paddingHorizontal: 5,
              }}
            >
              {isIncluded ? "Remove" : "Select"}
            </Text>
          </TouchableRipple>
        }
      </>
    </TouchableRipple>
  );
};

// <Button
//   mode="contained"
//   style={{ marginBottom: 10, borderRadius: 10 }}
//   contentStyle={{ padding: 5 }}
//   onPress={() => {
//     selectGenre((val) => [...val, item]);
//     navigation.navigate("ChoosePage");
//   }}
// >
//   {item.name}
// </Button>
