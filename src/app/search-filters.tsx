import { BlurView } from "expo-blur";
import Divider from "../components/Divider";
import IconButton from "../components/IconButton";
import Text from "../components/Text";
import TouchableRipple from "../components/TouchableRipple";
import React, { useMemo, useState } from "react";
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import Button from "../components/Button";
import { colors, fontWeight, fontSize, radius, spacing } from "../constants/design";
import PrimaryButton from "../components/PrimaryButton";
import GenreChip from "../components/GenreChip";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TransparentModalScreen from "../components/TransparentModalBackGesture";
import { useGetAllProvidersQuery, useGetGenresQuery } from "../redux/movie/movieApi";
import useTranslation from "../service/useTranslation";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function SearchFilters({ route }: any) {
  const [selectedProviders, setSelectedProviders] = useState<number[]>(route?.params?.providers || []);
  const { data: providers } = useGetAllProvidersQuery({});
  const [genres, setGenres] = useState<number[]>(route?.params?.genres || []);
  const [selectedPeople, setSelectedPeople] = useState(route?.params?.people || []);
  const [activeTab, setActiveTab] = useState<"movie" | "tv" | "both">("movie");

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

    router.back();

    setTimeout(() => {
      router.setParams(filters);
    }, 100);
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

  const insets = useSafeAreaInsets();

  return (
    <TransparentModalScreen>
      <BlurView style={{ flex: 1, paddingTop: insets.top }} intensity={50} tint="dark">
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <IconButton icon="chevron-left" iconColor={colors.text} onPress={() => router.back()} size={24} style={styles.closeButton} />

              <Button mode="text" onPress={resetFilters} textColor={colors.primary} style={styles.resetButton}>
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
            {/* <>
              <DropdownPersonSearch onSelectPerson={handlePeopleSelection} maxSelections={5} />
              <Divider style={styles.divider} />
            </> */}

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
                <TouchableOpacity
                  onPress={() => setActiveTab("movie")}
                  style={[
                    styles.chipWrapper,
                    styles.chip,
                    activeTab === "movie" && {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      backgroundColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, activeTab === "movie" && styles.chipTextActive]}>{t("voter.types.movie")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("tv")}
                  style={[
                    styles.chipWrapper,
                    activeTab === "tv" && {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      backgroundColor: colors.border,
                    },
                  ]}
                >
                  <BlurView style={[styles.chip]} intensity={activeTab === "tv" ? 15 : 5}>
                    <Text style={[styles.chipText, activeTab === "tv" && styles.chipTextActive]}>{t("voter.types.series")}</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>

              <View style={styles.genreChipsContainer}>
                {genreData.map((item) => (
                  <GenreChip
                    key={item.id}
                    genre={item.name}
                    selected={genres.includes(item.id)}
                    onPress={() => toggleGenre(item.id)}
                  />
                ))}
              </View>
            </Section>
          </ScrollView>

          <BlurView style={[styles.bottomBar, { paddingBottom: insets.bottom }]} tint="dark" intensity={50}>
            <PrimaryButton onPress={applyFilters} style={styles.applyButton}>
              {getFilterCount() > 0 ? `${t("search.apply")} (` + getFilterCount() + ")" : t("search.apply")}
            </PrimaryButton>
          </BlurView>
        </View>
      </BlurView>
    </TransparentModalScreen>
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
  },
  container: {
    flex: 1,
  },
  header: {
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm + 2,
  },
  headerContent: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  closeButton: {
    margin: 0,
  },
  resetButton: {
    margin: 0,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    marginTop: spacing.screen,
  },
  scrollContentContainer: {
    paddingBottom: spacing.xl * 5,
  },
  divider: {
    backgroundColor: colors.overlay,
    height: 1,
    marginVertical: spacing.md,
  },
  section: {
    paddingVertical: spacing.xs + 1,
  },
  sectionTitle: {
    fontSize: 30,
    lineHeight: 30,
    fontFamily: "Bebas",
    marginBottom: spacing.sm + 2,
    color: colors.text,
  },
  providersGrid: {
    paddingVertical: spacing.sm,
  },
  providerWrapper: {
    width: (width - 60) / 6,
    height: (width - 60) / 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "transparent",

    overflow: "hidden",
    marginRight: spacing.xs + 1,
  },
  selectedProvider: {
    borderColor: colors.primary,
    backgroundColor: "rgba(128, 0, 128, 0.15)",
  },
  providerLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: radius.sm,
  },
  genreTabsContainer: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    gap: spacing.sm + 2,
  },
  chipWrapper: {
    flex: 1,
    borderRadius: radius.pill,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.modal,
    alignItems: "center",
  },
  chipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  chipTextActive: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  genreChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.screen,
    borderTopWidth: 1,
    borderTopColor: colors.overlay,
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
    fontSize: fontSize.md + 1,
    color: "#aaa",
  },
  applyButton: {
    borderRadius: radius.lg,
    width: "100%",
    backgroundColor: colors.primary,
  },
  buttonContent: {
    padding: spacing.xs + 3.5,
  },
});
