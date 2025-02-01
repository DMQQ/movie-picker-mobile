import { FlatList, View } from "react-native";
import { Appbar, Button, Icon, Text, useTheme } from "react-native-paper";
import { useCreateRoom } from "./ContextProvider";
import SafeIOSContainer from "../../components/SafeIOSContainer";

const movies = [
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
];

const series = [
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

const categories = movies.concat(series);

type Category = {
  label: string;
  path: string;
};

export default function ChooseCategory({ navigation }: any) {
  const { setCategory, category } = useCreateRoom();

  const onPress = (category: Category) => {
    setCategory(category.path);

    if (category.path === "/discover/movie" || category.path === "/discover/tv") {
      navigation.navigate("ChooseGenre");
      return;
    }

    navigation.navigate("ChoosePage");
  };

  return (
    <SafeIOSContainer>
      <Appbar style={{ backgroundColor: "#000" }}>
        <Appbar.BackAction onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Landing"))} />
        <Appbar.Content title="Categories" />
      </Appbar>
      <View style={{ padding: 15, flex: 1 }}>
        <List category={category} data={movies} title="Movies" onPress={onPress} />

        <List category={category} data={series} title="Series" onPress={onPress} />

        <Button
          icon="dice-4"
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
    </SafeIOSContainer>
  );
}

const List = ({
  data,
  onPress,
  title,
  category,
}: {
  data: Category[];
  onPress: (category: Category) => void;
  title: string;
  category: string;
}) => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 45, lineHeight: 45, fontWeight: "bold", fontFamily: "Bebas" }}>{title}</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.path}
        renderItem={({ item: c }) => (
          <Button
            key={c.path}
            mode="contained"
            buttonColor={category === c.path ? theme.colors.secondary : theme.colors.surface}
            contentStyle={{
              padding: 5,
            }}
            style={{
              marginTop: 10,
              borderRadius: 10,
            }}
            onPress={() => {
              onPress(c);
            }}
          >
            {["/discover/movie", "/discover/tv"].includes(c.path) && <Icon source={"crown"} color="gold" size={16} />} {c.label}
          </Button>
        )}
      />
    </View>
  );
};
