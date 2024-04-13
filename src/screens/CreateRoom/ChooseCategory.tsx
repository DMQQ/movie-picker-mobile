import { View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { useCreateRoom } from "./ContextProvider";

const categories = [
  {
    label: "All movies",
    path: "/discover/movie",
  },
  {
    label: "Now playing",
    path: "/movie/now_playing",
  },
  {
    label: "Popular",
    path: "/movie/popular",
  },
  {
    label: "Top rated",
    path: "/movie/top_rated",
  },
  {
    label: "Upcoming",
    path: "/movie/upcoming",
  },
  {
    label: "All TV",
    path: "/discover/tv",
  },
  {
    label: "Top rated TV",
    path: "/tv/top_rated",
  },
  {
    label: "Popular TV",
    path: "/tv/popular",
  },
  {
    label: "Airing today",
    path: "/tv/airing_today",
  },
  {
    label: "On the air",
    path: "/tv/on_the_air",
  },
];

export default function ChooseCategory({ navigation }: any) {
  const { setCategory } = useCreateRoom();

  const onPress = (category: (typeof categories)[0]) => {
    setCategory(category.path);

    if (
      category.path === "/discover/movie" ||
      category.path === "/discover/tv"
    ) {
      navigation.navigate("ChooseGenre");
      return;
    }

    navigation.navigate("ChoosePage");
  };

  const theme = useTheme();

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <View style={{ flex: 1 }}>
        {categories.map((c, i) => (
          <Button
            key={i}
            mode="contained"
            buttonColor={theme.colors.surface}
            contentStyle={{ padding: 5 }}
            style={{ marginTop: 10, borderRadius: 10 }}
            onPress={() => {
              onPress(c);
            }}
          >
            {c.label}
          </Button>
        ))}
      </View>

      <Button
        mode="contained"
        style={{
          borderRadius: 100,
          marginTop: 10,
        }}
        contentStyle={{ padding: 7.5 }}
        onPress={() => {
          onPress(categories[Math.floor(Math.random() * categories.length)]);
        }}
      >
        Randomize
      </Button>
    </View>
  );
}
