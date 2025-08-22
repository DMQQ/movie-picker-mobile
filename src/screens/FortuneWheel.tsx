import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, ImageBackground, useWindowDimensions, View } from "react-native";
import { Button, IconButton, MD2DarkTheme, Text, TouchableRipple } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../types";
import { FancySpinner } from "../components/FancySpinner";
import FortuneWheelComponent from "../components/FortuneWheelComponent";
import SafeIOSContainer from "../components/SafeIOSContainer";
import { useGetCategoriesQuery, useLazyGetRandomSectionQuery, useLazyGetSectionMoviesQuery } from "../redux/movie/movieApi";
import useTranslation from "../service/useTranslation";
import fillMissing from "../utils/fillMissing";
import { shuffleInPlace } from "../utils/shuffle";
import { throttle } from "../utils/throttle";

const { width: screenWidth } = Dimensions.get("screen");

const Stack = createNativeStackNavigator<any>();

export default function FortuneWheelStack(props: any) {
  return (
    <Stack.Navigator
      initialRouteName="FortuneWheel"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FortuneWheel" component={FortuneWheel} />
      <Stack.Screen name="SectionSelector" component={SectionSelector} />
    </Stack.Navigator>
  );
}

function FortuneWheel({ navigation, route }: any) {
  const [signatures, setSignatures] = useState("");

  const wheelRef = useRef<{ spin: Function }>(null);

  const navigate = useCallback((item: Movie) => {
    setIsSpin(false);
    if (!item) return;
    const type = item?.type === "tv" ? "tv" : "movie";
    navigation.navigate("MovieDetails", {
      id: item.id,
      img: item.poster_path,
      type: type,
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

          const shuffled = shuffleInPlace(movies);

          setSelectedCards({
            results: fillMissing(shuffled.slice(0, 12), 12),
            name: response.data.name || "",
          });
          setSignatures(shuffled.map(({ id }) => id).join("-"));
        }
      };

      if (value) {
        getLazySection({ name: value as string }).then(handleResponse);
        return;
      }

      getLazyRandomSection(selectedCards.name).then(handleResponse);
    },
    [selectedCards.name]
  );

  const [isSpin, setIsSpin] = useState(false);

  useEffect(() => {
    if (route?.params?.category) {
      handleThrowDice(route.params.category);
    }
  }, [route?.params?.category, handleThrowDice]);

  useEffect(() => {
    if (!route?.params?.category) handleThrowDice();
  }, [route?.params?.category]);

  const { width, height } = useWindowDimensions();

  const t = useTranslation();

  return (
    <SafeIOSContainer style={{ overflow: "hidden" }}>
      <View style={{ backgroundColor: "#000", justifyContent: "space-between", zIndex: 999 }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} />
      </View>

      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={{ justifyContent: "center", alignItems: "center", height: height - 350, position: "absolute", top: 0, width }}
      >
        {isSpin && <FancySpinner size={150} />}

        {!isSpin && (
          <>
            <Text style={{ fontSize: 70, fontFamily: "Bebas" }}>{t("fortune-wheel.pick-a-movie")}</Text>
            <View style={{ flexDirection: "row" }}>
              <Button rippleColor={"#fff"} onPress={throttle(() => handleThrowDice(), 200)}>
                {t("fortune-wheel.random-category")}
              </Button>

              <Button
                rippleColor={"#fff"}
                onPress={throttle(() => {
                  navigation.navigate("SectionSelector");
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

export const SectionSelector = ({ navigation }: any) => {
  const { data, error } = useGetCategoriesQuery({});

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ backgroundColor: "#000", justifyContent: "space-between", zIndex: 999 }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} />
      </View>
      <FlatList
        numColumns={2}
        data={data}
        contentContainerStyle={{ gap: 10, padding: 10, paddingBottom: 50 }}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <TouchableRipple
            onPress={() => navigation.popTo("FortuneWheel", { category: item.name })}
            style={{
              marginRight: 10,
              width: Dimensions.get("window").width / 2 - 15,
              backgroundColor: MD2DarkTheme.colors.surface,
              height: 100,
            }}
          >
            <ImageBackground
              blurRadius={10}
              source={{
                uri: "https://image.tmdb.org/t/p/w200" + item.results[0].poster_path,
              }}
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
              borderRadius={10}
            >
              <Text
                style={{
                  fontSize: 25,
                  fontFamily: "Bebas",
                  color: "#fff",
                  textShadowColor: "rgba(0, 0, 0, 0.75)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 5,
                  textAlign: "center",
                  padding: 5,
                }}
              >
                {item.name}
              </Text>
            </ImageBackground>
          </TouchableRipple>
        )}
        keyExtractor={(item) => item.name}
      />
    </View>
  );
};
