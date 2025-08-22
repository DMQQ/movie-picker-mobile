// src/screens/Room/RoomSetup/RoomSetup.tsx

import { useCallback, useMemo, useReducer } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, IconButton } from "react-native-paper";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import PageHeading from "../../components/PageHeading";
import CategoryList from "../../components/Room/CategoryList";
import GenreList, { Genre } from "../../components/Room/GenreList";
import ProviderList from "../../components/Room/ProviderList";
import Section from "../../components/Room/Section";
import SelectionCard from "../../components/Room/SelectionCard";
import { useGetAllProvidersQuery, useGetGenresQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import { getMovieCategories, getSeriesCategories } from "../../utils/roomsConfig";

interface RoomSetupState {
  category: string;
  maxRounds: number;
  genre: Genre[];
  providers: number[];
  specialCategories: string[];
}

type RoomSetupAction =
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_MAX_ROUNDS"; payload: number }
  | { type: "SET_GENRE"; payload: Genre[] }
  | { type: "TOGGLE_GENRE"; payload: Genre }
  | { type: "SET_PROVIDERS"; payload: number[] }
  | { type: "TOGGLE_SPECIAL_CATEGORY"; payload: string };

const roomSetupReducer = (state: RoomSetupState, action: RoomSetupAction): RoomSetupState => {
  switch (action.type) {
    case "SET_CATEGORY":
      return { ...state, category: action.payload };
    case "SET_MAX_ROUNDS":
      return { ...state, maxRounds: action.payload };
    case "SET_GENRE":
      return { ...state, genre: action.payload };
    case "TOGGLE_GENRE":
      const genreExists = state.genre.some((g) => g.id === action.payload.id);
      return {
        ...state,
        genre: genreExists ? state.genre.filter((g) => g.id !== action.payload.id) : [...state.genre, action.payload],
      };
    case "SET_PROVIDERS":
      return { ...state, providers: action.payload };
    case "TOGGLE_SPECIAL_CATEGORY":
      const specialCategoryExists = state.specialCategories.includes(action.payload);
      return {
        ...state,
        specialCategories: specialCategoryExists
          ? state.specialCategories.filter((cat) => cat !== action.payload)
          : [...state.specialCategories, action.payload],
      };
    default:
      return state;
  }
};

export default function RoomSetup({ navigation }: any) {
  const t = useTranslation();

  const initialState: RoomSetupState = useMemo(
    () => ({
      category: getMovieCategories(t)[0]?.path || "",
      maxRounds: 3,
      genre: [],
      providers: [],
      specialCategories: [],
    }),
    [t]
  );

  const [state, dispatch] = useReducer(roomSetupReducer, initialState);
  const { category, maxRounds, genre, providers, specialCategories } = state;

  const isCategorySelected = !!category;
  const mediaType = useMemo(() => (category.includes("tv") ? "tv" : "movie"), [category]);

  const { data: genresData = [], isLoading: genresLoading } = useGetGenresQuery({ type: mediaType }, { skip: !isCategorySelected });
  const { data: providersData } = useGetAllProvidersQuery({});

  const categories = useMemo(() => {
    const movies = getMovieCategories(t);
    const series = getSeriesCategories(t);
    return [...movies, ...series];
  }, [t]);

  const gameTimeOptions = useMemo(
    () => [
      {
        value: 3,
        label: t("room.game_time_short") + " (5min)",
        iconData: { component: FontAwesome5, name: "bolt", color: "#FF6B35" },
      },
      {
        value: 6,
        label: t("room.game_time_medium") + " (10min)",
        iconData: { component: FontAwesome5, name: "clock", color: "#4ECDC4" },
      },
      {
        value: 10,
        label: t("room.game_time_long") + " (20min)",
        iconData: { component: FontAwesome5, name: "hourglass", color: "#FFD23F" },
      },
    ],
    [t]
  );

  const specialCategoryOptions = useMemo(
    () => [
      {
        id: "oscar",
        label: "Oscar Winners",
        iconData: { component: FontAwesome5, name: "trophy", color: "#FFD700" },
      },
      {
        id: "pg13",
        label: "PG-13",
        iconData: { component: FontAwesome5, name: "child", color: "#4CAF50" },
      },
      {
        id: "r_rated",
        label: "18+ Only",
        iconData: { component: FontAwesome5, name: "exclamation-triangle", color: "#FF5722" },
      },
      {
        id: "short_runtime",
        label: "<90m",
        iconData: { component: FontAwesome5, name: "clock", color: "#4CAF50" },
      },
      {
        id: "long_runtime",
        label: ">90m",
        iconData: { component: FontAwesome5, name: "hourglass-end", color: "#FF9800" },
      },
      {
        id: "90s",
        label: "90s",
        iconData: { component: FontAwesome5, name: "compact-disc", color: "#9C27B0" },
      },
      {
        id: "2000s",
        label: "2000s",
        iconData: { component: FontAwesome5, name: "mobile-alt", color: "#2196F3" },
      },
      {
        id: "2010s",
        label: "2010s",
        iconData: { component: FontAwesome5, name: "tablet-alt", color: "#FF9800" },
      },
      {
        id: "2020s",
        label: "2020s",
        iconData: { component: FontAwesome5, name: "wifi", color: "#00BCD4" },
      },
    ],
    []
  );

  const handleCategoryPress = useCallback((categoryPath: string) => {
    dispatch({ type: "SET_CATEGORY", payload: categoryPath });
  }, []);

  const handleMaxRoundsPress = useCallback((rounds: number) => {
    dispatch({ type: "SET_MAX_ROUNDS", payload: rounds });
  }, []);

  const handleGenrePress = useCallback((genreItem: Genre) => {
    dispatch({ type: "TOGGLE_GENRE", payload: genreItem });
  }, []);

  const handleProviderToggle = useCallback((newProviders: number[]) => {
    dispatch({
      type: "SET_PROVIDERS",
      payload: newProviders,
    });
  }, []);

  const handleSpecialCategoryToggle = useCallback((categoryId: string) => {
    dispatch({ type: "TOGGLE_SPECIAL_CATEGORY", payload: categoryId });
  }, []);

  const handleNextPress = useCallback(() => {
    navigation.navigate("CreateQRCode", {
      roomSetup: {
        category,
        maxRounds,
        genre,
        providers,
        specialCategories,
      },
    });
  }, [navigation, category, maxRounds, genre, providers, specialCategories]);

  const handleCreateRandomSetup = () => {
    let genres = [];
    if (genresData.length > 0) {
      genres = [...genresData].sort(() => 0.5 - Math.random()).slice(0, 5);
    }
    navigation.navigate("CreateQRCode", {
      roomSetup: {
        category: categories[Math.floor(Math.random() * categories.length)].path,
        maxRounds: 3,
        genre: genres,
        providers: providersData?.slice(0, 10).map((p) => p.provider_id) || [],
        specialCategories: specialCategoryOptions[Math.floor(Math.random() * specialCategoryOptions.length)].id,
      },
    });

    handleProviderToggle(providersData?.slice(0, 10).map((p) => p.provider_id) || []);
    handleCategoryPress(categories[Math.floor(Math.random() * categories.length)].path);
    if (genresData.length > 0) {
      const randomGenres = [...genresData].sort(() => 0.5 - Math.random()).slice(0, 5);
      dispatch({ type: "SET_GENRE", payload: randomGenres });
    }
    handleSpecialCategoryToggle(specialCategoryOptions[Math.floor(Math.random() * specialCategoryOptions.length)].id);
  };

  return (
    <View style={{ flex: 1 }}>
      <PageHeading title={t("room.movie") + " Setup"} />
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Section title={t("room.game_time")}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {gameTimeOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  label={option.label}
                  iconData={option.iconData}
                  isSelected={maxRounds === option.value}
                  onPress={() => handleMaxRoundsPress(option.value)}
                />
              ))}
            </ScrollView>
          </Section>

          <Section title={`${t("room.movie")} & ${t("room.series")}`}>
            <CategoryList categories={categories} selectedCategory={category} onCategoryPress={(cat) => handleCategoryPress(cat.path)} />
          </Section>

          <Section title={t("room.genre")} disabled={!isCategorySelected}>
            <GenreList
              genres={genresData}
              selectedGenres={genre}
              onGenrePress={handleGenrePress}
              isLoading={genresLoading}
              isCategorySelected={isCategorySelected}
            />
          </Section>

          <Section title="Special Categories" description="Filter by awards, age ratings, and decades" disabled={!isCategorySelected}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {specialCategoryOptions.map((option) => (
                <SelectionCard
                  key={option.id}
                  label={option.label}
                  iconData={option.iconData}
                  isSelected={specialCategories.includes(option.id)}
                  onPress={() => handleSpecialCategoryToggle(option.id)}
                />
              ))}
            </ScrollView>
          </Section>

          <Section title={t("room.providers")} disabled={!isCategorySelected}>
            <ProviderList
              providers={providersData || []}
              selectedProviders={providers}
              onToggleProvider={handleProviderToggle}
              isCategorySelected={isCategorySelected}
            />
          </Section>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.nextButton}
          contentStyle={styles.nextButtonContent}
          disabled={!isCategorySelected}
          onPress={handleNextPress}
        >
          {t("room.next")}
        </Button>

        <IconButton icon="dice-5" size={30} onPress={handleCreateRandomSetup} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20, // Reduced padding as button is outside scrollview
  },
  buttonContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextButton: {
    borderRadius: 100,
    flex: 1,
  },
  nextButtonContent: {
    paddingVertical: 7.5,
  },
});
