import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, Text } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Movie } from "../../../types";
import { FancySpinner } from "../../components/FancySpinner";
import FortuneWheelComponent from "../../components/FortuneWheelComponent";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useLazyGetRandomSectionQuery, useLazyGetSectionMoviesQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import fillMissing from "../../utils/fillMissing";
import { shuffleInPlace } from "../../utils/shuffle";
import { throttle } from "../../utils/throttle";
import PageHeading from "../../components/PageHeading";
import { router, useLocalSearchParams } from "expo-router";
import { FilterButton, useMediaFilters } from "../../components/MediaFilters";
import { useBlockedMovies } from "../../hooks/useBlockedMovies";

const { width: screenWidth } = Dimensions.get("screen");

export default function FortuneWheel() {
  const [signatures, setSignatures] = useState("");

  const wheelRef = useRef<{ spin: Function }>(null);

  const params = useLocalSearchParams();

  const { getFilterParams } = useMediaFilters();
  const { blockedMovies } = useBlockedMovies();

  const navigate = useCallback((item: Movie) => {
    setIsSpin(false);
    if (!item) return;
    const type = item?.type === "tv" ? "tv" : "movie";
    router.navigate({
      pathname: "/movie/type/[type]/[id]",
      params: {
        id: item.id,
        img: item.poster_path,
        type: type,
      },
    });
  }, []);

  const [selectedCards, setSelectedCards] = useState<{
    results: Movie[];
    name: string;
  }>({
    results: [],
    name: "",
  });

  const [getLazyRandomSection] = useLazyGetRandomSectionQuery();

  const [getLazySection] = useLazyGetSectionMoviesQuery();

  const handleThrowDice = useCallback(
    (value?: number | string) => {
      const handleResponse = async (response: any) => {
        if (response.data && Array.isArray(response.data.results)) {
          const movies = response.data.results as Movie[];

          await Promise.allSettled(movies.map((movie) => Image.prefetch("https://image.tmdb.org/t/p/w200" + movie.poster_path)));

          const shuffled = shuffleInPlace([...movies]);

          const newSelectedCards = {
            results: fillMissing(shuffled.slice(0, 10), 12),
            name: response.data.name || "",
          };

          setSelectedCards(newSelectedCards);
          setSignatures(shuffled.map(({ id }) => id).join("-"));
        } else {
          console.log("No data or results in response:", response);
        }
      };

      if (value) {
        getLazySection({ name: value as string })
          .then(handleResponse)
          .catch(console.error);
        return;
      }

      const filterParams = getFilterParams();
      const blockedIds = blockedMovies.map((m) => `${m.movie_type === "tv" ? "t" : "m"}${m.movie_id}`);
      getLazyRandomSection({ not: selectedCards.name, notMovies: blockedIds.join(","), ...filterParams })
        .then(handleResponse)
        .catch(console.error);
    },
    [selectedCards.name, getLazySection, getLazyRandomSection, getFilterParams, blockedMovies],
  );

  const [isSpin, setIsSpin] = useState(false);

  const handleFiltersApplied = useCallback(() => {
    if (!params?.category && !params?.movies) {
      handleThrowDice();
    }
  }, [handleThrowDice, params?.category, params?.movies]);

  useEffect(() => {
    if (params?.category) {
      handleThrowDice(params.category as string);
    }
  }, [params?.category, handleThrowDice]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!params?.category && !params?.movies) {
        handleThrowDice();
      } else if (params?.category && params?.movies) {
        handleThrowDice();
      } else if (params?.movies) {
        const movies =
          typeof params.movies === "string"
            ? (JSON.parse(params.movies) as Movie[])
            : (JSON.parse((params.movies as string[])[0]) as Movie[]);

        Promise.allSettled(movies.map((movie) => Image.prefetch("https://image.tmdb.org/t/p/w200" + movie.poster_path)));

        const shuffled = shuffleInPlace([...movies]);

        setSelectedCards({
          results: fillMissing(shuffled.slice(0, 12), 12),
          name: "",
        });
        setSignatures(shuffled.map(({ id }) => id).join("-"));
      }
    };

    bootstrap();
  }, [params?.category, params?.movies]);

  const { width, height } = useWindowDimensions();

  const t = useTranslation();

  return (
    <SafeIOSContainer style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <PageHeading showBackButton title="">
        <View style={fortuneStyles.filterButtonWrapper}>
          <FilterButton size={22} onApply={handleFiltersApplied} />
        </View>
      </PageHeading>

      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: height - 350,
          position: "absolute",
          top: 0,
          width,
        }}
      >
        {isSpin && <FancySpinner size={150} />}

        {!isSpin && (
          <>
            <Text
              style={{
                fontSize: params?.movies ? (params?.title.length > 10 ? 55 : 70) : 70,
                fontFamily: "Bebas",
                textAlign: "center",
              }}
            >
              {params?.movies ? params?.title : t("fortune-wheel.pick-a-movie")}
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Button rippleColor={"#fff"} onPress={throttle(() => handleThrowDice(), 200)}>
                {t("fortune-wheel.random-category")}
              </Button>

              <Button
                rippleColor={"#fff"}
                onPress={throttle(() => {
                  router.push("/fortune/filters");
                }, 500)}
              >
                {t("filters.categories")}
              </Button>
            </View>
          </>
        )}
      </Animated.View>

      {selectedCards?.results?.length > 0 && (
        <FortuneWheelComponent
          ref={wheelRef as any}
          style={{}}
          key={signatures}
          onSpinStart={() => {
            setIsSpin(true);
          }}
          onSelectedItem={navigate}
          size={screenWidth * 2}
          items={selectedCards.results as any}
        />
      )}
    </SafeIOSContainer>
  );
}

const fortuneStyles = StyleSheet.create({
  filterButtonWrapper: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 100,
  },
});
