import { useEffect, useState } from "react";
import FortuneWheelComponent from "../components/FortuneWheelComponent";
import SafeIOSContainer from "../components/SafeIOSContainer";
import { Dimensions, Image, ImageBackground, useWindowDimensions, View } from "react-native";
import {
  useGetLandingPageMoviesQuery,
  useGetMovieProvidersQuery,
  useGetMovieQuery,
  useLazyGetLandingPageMoviesQuery,
  useLazyGetMovieQuery,
} from "../redux/movie/movieApi";
import { Movie } from "../../types";
import Content from "../components/Movie/Content";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, SlideInUp, SlideOutDown, SlideOutUp } from "react-native-reanimated";
import ScoreRing from "../components/ScoreRing";
import { LinearGradient } from "expo-linear-gradient";
import { Appbar, Button, IconButton, Text } from "react-native-paper";
import MovieDetails from "../components/Movie/MovieDetails";
import WatchProviders from "../components/Movie/WatchProviders";
import { ScreenProps } from "./types";
import { FancySpinner } from "../components/FancySpinner";
import { throttle } from "./Home";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const AnimatedBackgroundImage = Animated.createAnimatedComponent(ImageBackground);

export default function FortuneWheel({ navigation }: ScreenProps<"FortuneWheel">) {
  const [signatures, setSignatures] = useState("");

  const [selectedItem, setSelectedItem] = useState<Movie | undefined>();

  const [getLazyMovies] = useLazyGetLandingPageMoviesQuery();

  const {
    data,
    refetch,
    isLoading: isMovieLoading,
  } = useGetMovieQuery({ id: selectedItem?.id!, type: selectedItem?.title ? "movie" : "tv" });

  const { data: providers = [], refetch: refetchProviders } = useGetMovieProvidersQuery({
    id: selectedItem?.id!,
    type: selectedItem?.title ? "movie" : "tv",
  });

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    let timeout: NodeJS.Timeout | null = null;

    Promise.any([refetch, refetchProviders]).then(() => {
      timeout = setTimeout(() => {
        setIsSpin(false);
      }, 500);
    });

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [selectedItem?.id]);

  const [selectedCards, setSelectedCards] = useState<Movie[]>([]);

  const handleThrowDice = () => {
    getLazyMovies({ skip: 0, take: 5 }).then((response) => {
      if (response.data && Array.isArray(response.data)) {
        const randomSection = response.data[Math.floor(Math.random() * response.data.length)];

        const movies = randomSection.results;

        const randomRange = Math.random();

        setSelectedCards(randomRange > 0.5 ? movies.slice(0, 12) : movies.slice(8, 20));

        setSignatures(movies.map(({ id }) => id).join("-"));
      }
    });
  };

  const [isSpin, setIsSpin] = useState(false);

  useEffect(() => {
    handleThrowDice();
  }, []);

  const { width, height } = useWindowDimensions();

  return (
    <SafeIOSContainer>
      {!selectedItem && (
        <View style={{ padding: 10, top: 0, position: "absolute", left: 0, zIndex: 100 }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        </View>
      )}
      {selectedItem && selectedItem?.id === data?.id ? (
        <AnimatedBackgroundImage
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            width,
            height: height,
            position: "absolute",
            marginBottom: 35,
            zIndex: 100,
          }}
          source={{
            uri: "https://image.tmdb.org/t/p/w500" + data?.poster_path,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width,
              justifyContent: "space-between",
              flexDirection: "row",
              padding: 10,
              zIndex: 100,
            }}
          >
            <IconButton
              icon="close"
              onPress={() => {
                setSelectedItem(undefined);
              }}
            />
            <ScoreRing score={data?.vote_average || 0} />
          </View>

          <LinearGradient
            style={{ flex: 1, padding: 10, position: "absolute", top: 0, width, height, justifyContent: "flex-end" }}
            colors={["transparent", "rgba(0,0,0,0.5)", "#000000"]}
          >
            <View style={{ marginBottom: 80, padding: 10, gap: 0 }}>
              <Text style={{ fontSize: 50, fontFamily: "Bebas", width: width - 80 }}>{data?.title || selectedItem?.name}</Text>

              <Text style={{ fontSize: 16 }}>{data?.overview}</Text>

              <WatchProviders hideLabel providers={providers} style={{ marginTop: 0 }} />

              <Button
                mode="contained"
                onPress={() => {
                  setSelectedItem(undefined);
                }}
                contentStyle={{ padding: 5 }}
                style={{ borderRadius: 100, marginTop: 30 }}
              >
                Roll Again
              </Button>
            </View>
          </LinearGradient>
        </AnimatedBackgroundImage>
      ) : (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{ justifyContent: "center", alignItems: "center", height: height - 350, position: "absolute", top: 0, width }}
        >
          {isSpin && <FancySpinner size={150} />}

          {!isSpin && (
            <>
              <Text style={{ fontSize: 50, fontFamily: "Bebas" }}>Drag the weel up to spin!</Text>
              <Button rippleColor={"#fff"} onPress={throttle(handleThrowDice, 500)}>
                Change movies!
              </Button>
            </>
          )}
        </Animated.View>
      )}

      <FortuneWheelComponent
        style={{}}
        key={signatures}
        onSpinStart={() => {
          setSelectedItem(undefined);

          setIsSpin(true);
        }}
        onSelectedItem={(item) => {
          setSelectedItem(item);
        }}
        size={screenWidth * 1.75}
        items={selectedCards as any}
      />
    </SafeIOSContainer>
  );
}
