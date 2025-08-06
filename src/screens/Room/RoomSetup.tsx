// src/screens/Room/RoomSetup/RoomSetup.tsx

import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import PageHeading from "../../components/PageHeading";
import CategoryList from "../../components/Room/CategoryList";
import GenreList, { Genre } from "../../components/Room/GenreList";
import ProviderList from "../../components/Room/ProviderList";
import Section from "../../components/Room/Section";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useGetAllProvidersQuery, useGetGenresQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import { getMovieCategories, getSeriesCategories } from "../../utils/roomsConfig";
import { useCreateRoom } from "./ContextProvider";

export default function RoomSetup({ navigation }: any) {
  const { category, setCategory, genre, setGenre, providers, setProviders } = useCreateRoom();
  const t = useTranslation();

  const isCategorySelected = !!category;
  const mediaType = category.includes("tv") ? "tv" : "movie";

  const { data: genresData = [], isLoading: genresLoading } = useGetGenresQuery({ type: mediaType }, { skip: !isCategorySelected });
  const { data: providersData } = useGetAllProvidersQuery({});

  const categories = useMemo(() => {
    const movies = getMovieCategories(t);
    const series = getSeriesCategories(t);
    return [...movies, ...series];
  }, [t]);

  const handleGenrePress = (genreItem: Genre) => {
    setGenre((prev: Genre[]) =>
      prev.some((g) => g.id === genreItem.id) ? prev.filter((g) => g.id !== genreItem.id) : [...prev, genreItem]
    );
  };

  const handleNextPress = () => {
    // Note: The `providers` state in context is already up-to-date
    navigation.navigate("CreateQRCode");
  };

  return (
    <SafeIOSContainer>
      <PageHeading title={t("room.movie") + " Setup"} />
      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Section title={`${t("room.movie")} & ${t("room.series")}`}>
            <CategoryList categories={categories} selectedCategory={category} onCategoryPress={(cat) => setCategory(cat.path)} />
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
              providers={providersData}
              selectedProviders={providers} // This is correct
              onToggleProvider={setProviders} // This is also correct
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
    </SafeIOSContainer>
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
  },
  nextButton: {
    borderRadius: 100,
  },
  nextButtonContent: {
    paddingVertical: 7.5,
  },
});
