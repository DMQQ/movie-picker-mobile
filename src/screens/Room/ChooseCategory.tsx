import { SectionList, View, Dimensions } from "react-native";
import { Appbar, Button, Icon, IconButton, Text, useTheme, Card } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCreateRoom } from "./ContextProvider";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";
import { useMemo } from "react";
import PageHeading from "../../components/PageHeading";
import { getConstrainedDimensions } from "../../utils/getConstrainedDimensions";

type Category = {
  label: string;
  path: string;
  icon: string;
};

const getFormattedDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
};

const { width } = getConstrainedDimensions("window");
const buttonWidth = (width - 60) / 3;

const getCategoryIcon = (path: string, isSelected: boolean, theme: any) => {
  const iconMap: { [key: string]: { component: any; name: string; color: string } } = {
    // Movies
    "/discover/movie?sort_by=popularity.desc&vote_count.gte=100": {
      component: MaterialIcons,
      name: "movie",
      color: "#FF6B35",
    },
    [`/discover/movie?primary_release_date.gte=${getFormattedDate(
      -30
    )}&primary_release_date.lte=${getFormattedDate()}&sort_by=release_date.desc`]: {
      component: FontAwesome5,
      name: "play-circle",
      color: "#4ECDC4",
    },
    "/discover/movie?sort_by=popularity.desc&vote_count.gte=200": {
      component: FontAwesome5,
      name: "fire",
      color: "#FFD23F",
    },
    "/discover/movie?sort_by=vote_average.desc&vote_count.gte=300": {
      component: FontAwesome,
      name: "star",
      color: "#FF8C69",
    },
    "/movie/upcoming": {
      component: FontAwesome5,
      name: "calendar-alt",
      color: "#8B4513",
    },
    // Series
    "/discover/tv?sort_by=popularity.desc&vote_count.gte=100": {
      component: FontAwesome5,
      name: "tv",
      color: "#9370DB",
    },
    "/discover/tv?sort_by=vote_average.desc&vote_count.gte=300": {
      component: FontAwesome5,
      name: "star-of-life",
      color: "#32CD32",
    },
    "/discover/tv?sort_by=popularity.desc&vote_count.gte=200": {
      component: FontAwesome5,
      name: "chart-line",
      color: "#DA70D6",
    },
    [`/discover/tv?air_date.gte=${getFormattedDate()}&air_date.lte=${getFormattedDate()}&sort_by=popularity.desc`]: {
      component: FontAwesome5,
      name: "broadcast-tower",
      color: "#CD853F",
    },
    [`/tv/airing_today?first_air_date.gte=${getFormattedDate(-7)}&first_air_date.lte=${getFormattedDate(7)}&sort_by=popularity.desc`]: {
      component: FontAwesome5,
      name: "satellite-dish",
      color: "#2F4F4F",
    },
  };

  const iconData = iconMap[path] || { component: MaterialIcons, name: "local-offer", color: "#808080" };

  return {
    component: iconData.component,
    name: iconData.name,
    color: isSelected ? theme.colors.onPrimary : iconData.color,
  };
};

export default function ChooseCategory({ navigation }: any) {
  const { setCategory, category } = useCreateRoom();
  const theme = useTheme();

  const t = useTranslation();

  const movies = useMemo(
    () => [
      { label: t("room.genres.all_movies"), path: "/discover/movie?sort_by=popularity.desc&vote_count.gte=100", icon: "movie" },
      {
        label: t("room.genres.now_playing"),
        path: `/discover/movie?primary_release_date.gte=${getFormattedDate(
          -30
        )}&primary_release_date.lte=${getFormattedDate()}&sort_by=release_date.desc`,
        icon: "play-circle",
      },
      { label: t("room.genres.popular"), path: `/discover/movie?sort_by=popularity.desc&vote_count.gte=200`, icon: "fire" },
      { label: t("room.genres.top_rated"), path: `/discover/movie?sort_by=vote_average.desc&vote_count.gte=300`, icon: "star" },
      {
        label: t("room.genres.upcoming"),
        path: `/movie/upcoming`,
        icon: "calendar",
      },
    ],
    []
  );

  const series = useMemo(
    () => [
      { label: t("room.genres.all_tv"), path: "/discover/tv?sort_by=popularity.desc&vote_count.gte=100", icon: "television" },
      { label: t("room.genres.top_rated_tv"), path: `/discover/tv?sort_by=vote_average.desc&vote_count.gte=300`, icon: "star-circle" },
      { label: t("room.genres.popular_tv"), path: `/discover/tv?sort_by=popularity.desc&vote_count.gte=200`, icon: "trending-up" },
      {
        label: t("room.genres.airing_today"),
        path: `/discover/tv?air_date.gte=${getFormattedDate()}&air_date.lte=${getFormattedDate()}&sort_by=popularity.desc`,
        icon: "broadcast",
      },
      {
        label: t("room.genres.on_the_air"),
        path: `/tv/airing_today?first_air_date.gte=${getFormattedDate(-7)}&first_air_date.lte=${getFormattedDate(
          7
        )}&sort_by=popularity.desc`,
        icon: "radio-tower",
      },
    ],
    []
  );

  const chunkArray = (array: Category[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const sections = useMemo(
    () => [
      { title: t("room.movie"), data: chunkArray(movies, 3) },
      { title: t("room.series"), data: chunkArray(series, 3) },
    ],
    [movies, series]
  );

  const categories = useMemo(() => {
    return [...movies, ...series];
  }, []);

  const onPress = (category: Category) => {
    setCategory(category.path);
    navigation.navigate("ChooseGenre");
  };

  const renderCategoryItem = (c: Category) => {
    const iconData = getCategoryIcon(c.path, category === c.path, theme);
    const IconComponent = iconData.component;

    return (
      <View key={c.path} style={{ width: buttonWidth, marginRight: 15, marginBottom: 15 }}>
        <Card
          style={{
            backgroundColor: category === c.path ? theme.colors.primary : theme.colors.surface,
            borderRadius: 15,
          }}
          onPress={() => onPress(c)}
        >
          <View
            style={{
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <IconComponent name={iconData.name} size={35} color={iconData.color} />
            <Text
              numberOfLines={2}
              style={{
                textAlign: "center",
                marginTop: 15,
                fontSize: 18,
                fontWeight: "700",
                fontFamily: "Bebas",
                color: category === c.path ? theme.colors.onPrimary : theme.colors.onSurface,
              }}
            >
              {c.label}
            </Text>
          </View>
        </Card>
      </View>
    );
  };

  const renderItem = ({ item: row }: { item: Category[] }) => (
    <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>{row.map(renderCategoryItem)}</View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text
      style={{
        fontSize: 45,
        lineHeight: 45,
        fontFamily: "Bebas",
        marginBottom: 15,
        marginTop: 10,
      }}
    >
      {title}
    </Text>
  );

  return (
    <SafeIOSContainer>
      <PageHeading title={t("room.movie") + " & " + t("room.series")} />
      <View style={{ flex: 1 }}>
        <View style={{ padding: 15, flex: 1 }}>
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => `row-${index}`}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={{ paddingHorizontal: 15 }}>
          <Button
            // icon="dice-4"
            mode="contained"
            style={{
              borderRadius: 100,
            }}
            contentStyle={{ padding: 7.5 }}
            onPress={() => {
              if (category) {
                navigation.navigate("ChooseGenre");
              } else onPress(categories[Math.floor(Math.random() * categories.length)]);
            }}
            {...(category ? { icon: undefined } : { icon: "dice-multiple" })}
          >
            {category ? t("room.next") : t("room.randomize")}
          </Button>
        </View>
      </View>
    </SafeIOSContainer>
  );
}
