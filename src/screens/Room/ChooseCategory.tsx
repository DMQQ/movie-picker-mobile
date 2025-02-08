import { FlatList, View } from "react-native";
import { Appbar, Button, Icon, Text, useTheme } from "react-native-paper";
import { useCreateRoom } from "./ContextProvider";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";
import { useMemo } from "react";

type Category = {
  label: string;
  path: string;
};

const getFormattedDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
};

export default function ChooseCategory({ navigation }: any) {
  const { setCategory, category } = useCreateRoom();

  const t = useTranslation();

  const movies = useMemo(
    () => [
      { label: t("room.genres.all_movies"), path: "/discover/movie" },
      {
        label: t("room.genres.now_playing"),
        path: `/discover/movie?primary_release_date.gte=${getFormattedDate(-30)}&primary_release_date.lte=${getFormattedDate()}`,
      },
      { label: t("room.genres.popular"), path: `/discover/movie?sort_by=popularity.desc` },
      { label: t("room.genres.top_rated"), path: `/discover/movie?sort_by=vote_average.desc&vote_count.gte=300` },
      {
        label: t("room.genres.upcoming"),
        path: `/discover/movie?primary_release_date.gte=${getFormattedDate()}&primary_release_date.lte=${getFormattedDate(90)}`,
      },
    ],
    []
  );

  const series = useMemo(
    () => [
      { label: t("room.genres.all_tv"), path: "/discover/tv" },
      { label: t("room.genres.top_rated_tv"), path: `/discover/tv?sort_by=vote_average.desc&vote_count.gte=300` },
      { label: t("room.genres.popular_tv"), path: `/discover/tv?sort_by=popularity.desc` },
      { label: t("room.genres.airing_today"), path: `/discover/tv?air_date.gte=${getFormattedDate()}&air_date.lte=${getFormattedDate()}` },
      { label: t("room.genres.on_the_air"), path: `/discover/tv?air_date.gte=${getFormattedDate()}&air_date.lte=${getFormattedDate(7)}` },
    ],
    []
  );

  const categories = useMemo(() => {
    return [...movies, ...series];
  }, []);

  const onPress = (category: Category) => {
    setCategory(category.path);

    navigation.navigate("ChooseGenre");
  };

  return (
    <SafeIOSContainer>
      <Appbar style={{ backgroundColor: "#000" }}>
        <Appbar.BackAction onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Landing"))} />
        <Appbar.Content title="Categories" />
      </Appbar>
      <View style={{ padding: 15, flex: 1 }}>
        <List category={category} data={movies} title={t("room.movie")} onPress={onPress} />

        <List category={category} data={series} title={t("room.series")} onPress={onPress} />

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
          {t("room.randomize")}
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
            {c.label}
          </Button>
        )}
      />
    </View>
  );
};
