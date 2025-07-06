import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View, ScrollView } from "react-native";
import { useGetAllProvidersQuery, useGetGenresQuery } from "../redux/movie/movieApi";
import { Appbar, Button, IconButton, MD2DarkTheme, Text, TouchableRipple, Divider, Surface, Chip } from "react-native-paper";
import useTranslation from "../service/useTranslation";
import DropdownPersonSearch from "../components/DropdownSearchPeron";
import { SafeAreaView } from "react-native-safe-area-context";
import { getConstrainedDimensions } from "../utils/getConstrainedDimensions";

const { width } = getConstrainedDimensions("window");

export default function SearchFilters({ navigation, route }: any) {
  const [selectedProviders, setSelectedProviders] = useState<number[]>(route?.params?.providers || []);
  const { data: providers } = useGetAllProvidersQuery({});
  const [genres, setGenres] = useState<number[]>(route?.params?.genres || []);
  const [selectedPeople, setSelectedPeople] = useState(route?.params?.people || []);
  const [activeTab, setActiveTab] = useState<"movie" | "tv">("movie");

  const t = useTranslation();

  const { data: movies } = useGetGenresQuery({ type: "movie" });
  const { data: tv } = useGetGenresQuery({ type: "tv" });

  const toggleProvider = (providerId: number) => {
    setSelectedProviders((prev) => (prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId]));
  };

  const toggleGenre = (genreId: number) => {
    setGenres((prev) => (prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]));
  };

  const handlePeopleSelection = (people: any) => {
    setSelectedPeople(people);
  };

  const resetFilters = () => {
    setSelectedProviders([]);
    setGenres([]);
    setSelectedPeople([]);
  };

  const applyFilters = () => {
    // Implement your filter application logic here
    const filters = {
      providers: selectedProviders,
      genres,
      people: typeof selectedPeople?.[0] === "number" ? selectedPeople : selectedPeople.map((person) => person?.id),
    };
    navigation.popTo("Search", filters);
  };

  const genreData = useMemo(() => {
    if (activeTab === "movie") {
      return movies || [];
    }
    return tv || [];
  }, [activeTab, movies, tv]);

  const getFilterCount = () => {
    return selectedProviders.length + genres.length + selectedPeople.length;
  };

  const [limitProviders, setLimitProviders] = useState(18);

  return (
    <SafeAreaView style={styles.safeArea} edges={["right", "left"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <IconButton icon="chevron-left" iconColor="#fff" onPress={() => navigation.pop()} size={24} style={styles.closeButton} />

            <Button mode="text" onPress={resetFilters} textColor={MD2DarkTheme.colors.primary} style={styles.resetButton}>
              Reset
            </Button>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {route.params?.type !== "both" && (
            <>
              <DropdownPersonSearch onSelectPerson={handlePeopleSelection} maxSelections={5} />
              <Divider style={styles.divider} />
            </>
          )}
          {/* Streaming Services */}
          <Section title={t("room.providers")}>
            <FlatList
              data={(providers || []).slice(0, limitProviders)}
              keyExtractor={(item) => item.provider_id.toString()}
              horizontal={false}
              numColumns={6}
              scrollEnabled={false}
              contentContainerStyle={styles.providersGrid}
              renderItem={({ item }) => (
                <TouchableRipple
                  onPress={() => toggleProvider(item.provider_id)}
                  style={[styles.providerWrapper, selectedProviders.includes(item.provider_id) && styles.selectedProvider]}
                >
                  <Image source={{ uri: `https://image.tmdb.org/t/p/w200${item?.logo_path}` }} style={styles.providerLogo} />
                </TouchableRipple>
              )}
              ListFooterComponent={
                <Button
                  onPress={() => (limitProviders < (providers || [])?.length ? setLimitProviders((p) => p + 12) : setLimitProviders(18))}
                >
                  {limitProviders < (providers || [])?.length ? t("search.more") : t("search.less")}
                </Button>
              }
            />
          </Section>

          <Divider style={styles.divider} />

          {/* Genres */}
          <Section title={t("search.genres")}>
            <View style={styles.genreTabsContainer}>
              <TouchableRipple
                onPress={() => setActiveTab("movie")}
                style={[styles.genreTab, activeTab === "movie" && styles.activeGenreTab]}
              >
                <Text style={[styles.genreTabText, activeTab === "movie" && styles.activeGenreTabText]}>{t("voter.types.movie")}</Text>
              </TouchableRipple>
              <TouchableRipple onPress={() => setActiveTab("tv")} style={[styles.genreTab, activeTab === "tv" && styles.activeGenreTab]}>
                <Text style={[styles.genreTabText, activeTab === "tv" && styles.activeGenreTabText]}>{t("voter.types.series")}</Text>
              </TouchableRipple>
            </View>

            <View style={styles.genreChipsContainer}>
              {genreData.map((item) => (
                <Chip
                  key={item.id}
                  selected={genres.includes(item.id)}
                  onPress={() => toggleGenre(item.id)}
                  style={[styles.genreChip, genres.includes(item.id) && styles.selectedGenreChip]}
                  textStyle={[styles.genreChipText, genres.includes(item.id) && styles.selectedGenreChipText]}
                  showSelectedCheck={false}
                  elevated
                >
                  {item.name}
                </Chip>
              ))}
            </View>
          </Section>
        </ScrollView>

        <Surface style={styles.bottomBar}>
          <Button mode="contained" onPress={applyFilters} style={styles.applyButton} contentStyle={styles.buttonContent}>
            {getFilterCount() > 0 ? `${t("search.apply")} (` + getFilterCount() + ")" : t("search.apply")}
          </Button>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    backgroundColor: "#000",
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
  },
  headerContent: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
  closeButton: {
    margin: 0,
  },
  resetButton: {
    margin: 0,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 15,
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
  divider: {
    backgroundColor: "rgba(255,255,255,0.08)",
    height: 1,
    marginVertical: 12,
  },
  section: {
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 30,
    lineHeight: 30,
    fontFamily: "Bebas",
    marginBottom: 10,
    color: "#fff",
  },
  providersGrid: {
    paddingVertical: 8,
  },
  providerWrapper: {
    width: (width - 60) / 6,
    height: (width - 60) / 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1a1a1a",
    overflow: "hidden",
    marginRight: 5,
  },
  selectedProvider: {
    borderColor: MD2DarkTheme.colors.primary,
    backgroundColor: "rgba(128, 0, 128, 0.15)",
  },
  providerLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 8,
  },
  genreTabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    padding: 4,
  },
  genreTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeGenreTab: {
    backgroundColor: "rgba(128, 0, 128, 0.2)",
  },
  genreTabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#888",
  },
  activeGenreTabText: {
    color: MD2DarkTheme.colors.primary,
  },
  genreChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  genreChip: {
    margin: 4,
    backgroundColor: "#1a1a1a",
    borderColor: "transparent",
  },
  selectedGenreChip: {
    backgroundColor: "rgba(128, 0, 128, 0.15)",
    borderColor: "rgba(128, 0, 128, 0.3)",
  },
  genreChipText: {
    color: "#ddd",
  },
  selectedGenreChipText: {
    color: MD2DarkTheme.colors.primary,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,

    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    elevation: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  filterCountContainer: {
    flex: 1,
  },
  filterCountText: {
    fontSize: 15,
    color: "#aaa",
  },
  applyButton: {
    borderRadius: 24,
    width: "100%",
    backgroundColor: MD2DarkTheme.colors.primary,
  },
  buttonContent: {
    padding: 7.5,
  },
});
