// src/screens/Room/RoomSetup/RoomSetup.tsx

import { useCallback, useMemo, useReducer } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
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
}

type RoomSetupAction =
  | { type: "SET_CATEGORY"; payload: string }
  | { type: "SET_MAX_ROUNDS"; payload: number }
  | { type: "SET_GENRE"; payload: Genre[] }
  | { type: "TOGGLE_GENRE"; payload: Genre }
  | { type: "SET_PROVIDERS"; payload: number[] };

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
    }),
    [t]
  );

  const [state, dispatch] = useReducer(roomSetupReducer, initialState);
  const { category, maxRounds, genre, providers } = state;

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
        label: t("room.game_time_short"),
        iconData: { component: FontAwesome5, name: "bolt", color: "#FF6B35" },
      },
      {
        value: 6,
        label: t("room.game_time_medium"),
        iconData: { component: FontAwesome5, name: "clock", color: "#4ECDC4" },
      },
      {
        value: 10,
        label: t("room.game_time_long"),
        iconData: { component: FontAwesome5, name: "hourglass", color: "#FFD23F" },
      },
    ],
    [t]
  );

  // Memoized callbacks for optimal performance
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

  const handleNextPress = useCallback(() => {
    navigation.navigate("CreateQRCode", {
      roomSetup: {
        category,
        maxRounds,
        genre,
        providers,
      },
    });
  }, [navigation, category, maxRounds, genre, providers]);

  return (
    <View style={{ flex: 1 }}>
      <PageHeading title={t("room.movie") + " Setup"} />
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Section title={t("room.game_time")} description={t("room.game_time_desc")}>
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

          <Section title={t("room.genre")} description={t("room.genre_desc")} disabled={!isCategorySelected}>
            <GenreList
              genres={genresData}
              selectedGenres={genre}
              onGenrePress={handleGenrePress}
              isLoading={genresLoading}
              isCategorySelected={isCategorySelected}
            />
          </Section>

          <Section title={t("room.providers")} description={t("room.provider_desc")} disabled={!isCategorySelected}>
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
  },
  nextButton: {
    borderRadius: 100,
  },
  nextButtonContent: {
    paddingVertical: 7.5,
  },
});
