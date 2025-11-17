import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, ImageBackground, Platform, useWindowDimensions, View } from "react-native";
import { Button, IconButton, MD2DarkTheme, Text, TouchableRipple } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../../types";
import { FancySpinner } from "../../components/FancySpinner";
import FortuneWheelComponent from "../../components/FortuneWheelComponent";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useGetCategoriesQuery, useLazyGetRandomSectionQuery, useLazyGetSectionMoviesQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import fillMissing from "../../utils/fillMissing";
import { shuffleInPlace } from "../../utils/shuffle";
import { throttle } from "../../utils/throttle";
import PageHeading from "../../components/PageHeading";
import { router, useLocalSearchParams } from "expo-router";

const { width: screenWidth } = Dimensions.get("screen");

export default function FortuneWheel() {
  const [signatures, setSignatures] = useState("");

  const wheelRef = useRef<{ spin: Function }>(null);

  const params = useLocalSearchParams();

  console.log("Params:", params);

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
            results: fillMissing(shuffled.slice(0, 12), 12),
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

      getLazyRandomSection(selectedCards.name).then(handleResponse).catch(console.error);
    },
    [selectedCards.name, getLazySection, getLazyRandomSection]
  );

  const [isSpin, setIsSpin] = useState(false);

  useEffect(() => {
    if (params?.category) {
      handleThrowDice(params.category);
    }
  }, [params?.category, handleThrowDice]);

  useEffect(() => {
    if (!params?.category && !params?.movies) handleThrowDice();
    else if (params?.category && params?.movies) handleThrowDice();
    else if (params?.movies) {
      const movies =
        typeof params.movies === "string"
          ? (JSON.parse(params.movies) as Movie[])
          : (JSON.parse((params.movies as string[])[0]) as Movie[]);

      Promise.allSettled(movies.map((movie) => Image.prefetch("https://image.tmdb.org/t/p/w200" + movie.poster_path))).then(() => {
        const shuffled = shuffleInPlace([...movies]);

        setSelectedCards({
          results: fillMissing(shuffled.slice(0, 12), 12),
          name: "",
        });
        setSignatures(shuffled.map(({ id }) => id).join("-"));
      });
    }
  }, [params?.category, params?.movies]);

  const { width, height } = useWindowDimensions();

  const t = useTranslation();

  const insets = useSafeAreaInsets();

  return (
    <SafeIOSContainer style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <PageHeading
        showBackButton
        title=""
        styles={
          Platform.OS === "android" && {
            marginTop: insets.top + 30,
          }
        }
      />

      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={{ justifyContent: "center", alignItems: "center", height: height - 350, position: "absolute", top: 0, width }}
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
                {t("fortune-wheel.pick-category")}
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
          size={screenWidth * 1.75}
          items={selectedCards.results as any}
        />
      )}
    </SafeIOSContainer>
  );
}
