import { useEffect, useState } from "react";
import FortuneWheelComponent from "../components/FortuneWheelComponent";
import SafeIOSContainer from "../components/SafeIOSContainer";
import { Dimensions, FlatList, Image, ImageBackground, Platform, useWindowDimensions, View } from "react-native";
import {
  useGetLandingPageMoviesQuery,
  useGetMovieProvidersQuery,
  useGetMovieQuery,
  useLazyGetLandingPageMoviesQuery,
} from "../redux/movie/movieApi";
import { Movie } from "../../types";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, SlideInUp, SlideOutDown, SlideOutUp } from "react-native-reanimated";
import ScoreRing from "../components/ScoreRing";
import { LinearGradient } from "expo-linear-gradient";
import { Appbar, Button, IconButton, MD2DarkTheme, Menu, Modal, Text, TouchableRipple } from "react-native-paper";
import WatchProviders from "../components/Movie/WatchProviders";
import { ScreenProps } from "./types";
import { FancySpinner } from "../components/FancySpinner";
import { throttle } from "./Home";
import Favourite from "../components/Favourite";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const AnimatedBackgroundImage = Animated.createAnimatedComponent(ImageBackground);

export default function FortuneWheel({ navigation }: ScreenProps<"FortuneWheel">) {
  const [signatures, setSignatures] = useState("");

  const [selectedItem, setSelectedItem] = useState<(Movie & { type: string }) | undefined>();

  const [getLazyMovies] = useLazyGetLandingPageMoviesQuery();

  const type = selectedItem?.type === "tv" ? "tv" : "movie";

  const { data, refetch, isLoading: isMovieLoading } = useGetMovieQuery({ id: selectedItem?.id!, type });

  const { data: providers = [], refetch: refetchProviders } = useGetMovieProvidersQuery({
    id: selectedItem?.id!,
    type,
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
    getLazyMovies({ skip: 0, take: 5 }).then(async (response) => {
      if (response.data && Array.isArray(response.data)) {
        const randomSection = response.data[Math.floor(Math.random() * response.data.length)];

        const movies = randomSection.results;

        Promise.any(
          movies.map((movie) => {
            return Image.prefetch("https://image.tmdb.org/t/p/w200" + movie.poster_path);
          })
        );

        setSelectedCards(movies.slice(0, 12));

        setSignatures(movies.map(({ id }) => id).join("-"));
      }
    });
  };

  const [isSpin, setIsSpin] = useState(false);

  useEffect(() => {
    handleThrowDice();
  }, []);

  const { width, height } = useWindowDimensions();

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  return (
    <SafeIOSContainer>
      {!selectedItem && !categoryModalVisible && (
        <Appbar.Header style={{ backgroundColor: "#000", justifyContent: "space-between", zIndex: 999 }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        </Appbar.Header>
      )}
      {selectedItem && selectedItem?.id === data?.id ? (
        <AnimatedBackgroundImage
          entering={FadeInDown.duration(350)}
          exiting={FadeOutDown.duration(350)}
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
              top: Platform.OS === "ios" ? 0 : 10,
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
            <View style={{ marginBottom: Platform.OS === "ios" ? 80 : 10, padding: 10, gap: 0 }}>
              <Text style={{ fontSize: 50, fontFamily: "Bebas", lineHeight: 50 }}>{data?.title || data?.name}</Text>

              <Text style={{ color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>
                {data?.release_date || data?.first_air_date} |{" "}
                {(data?.title || data?.name) === (data?.original_title || data?.original_name)
                  ? ""
                  : data?.original_title || data?.original_name}{" "}
                | {(data?.genres as { id: number; name: string }[]).map((d) => d.name)?.join(" | ")}
              </Text>

              <Text style={{ fontSize: 16 }}>{data?.overview}</Text>

              <WatchProviders hideLabel providers={providers} style={{ marginTop: 0 }} />

              <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10 }}>
                <Button
                  mode="contained"
                  onPress={() => {
                    setSelectedItem(undefined);
                  }}
                  contentStyle={{ padding: 5 }}
                  style={{ borderRadius: 100, flex: 1 }}
                >
                  Roll Again
                </Button>

                <Favourite movie={data as Movie} />
              </View>
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
              <Text style={{ fontSize: 70, fontFamily: "Bebas" }}>Spin the wheel!</Text>
              <View style={{ flexDirection: "row" }}>
                <Button rippleColor={"#fff"} onPress={throttle(handleThrowDice, 200)}>
                  Random Category
                </Button>

                <Button rippleColor={"#fff"} onPress={throttle(() => setCategoryModalVisible((p) => !p), 500)}>
                  Pick a Category
                </Button>
              </View>
            </>
          )}
        </Animated.View>
      )}

      {selectedCards.length > 0 && (
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
      )}

      <Modal visible={categoryModalVisible}>
        <View style={{ height: "100%", backgroundColor: "rgba(0,0,0,0.8)", marginTop: 200 }}>
          <SectionSelector
            onSelectItem={(data) => {
              setSelectedCards(data.slice(0, 12));

              setSignatures(data.map(({ id }) => id).join("-"));

              setCategoryModalVisible(false);
            }}
          />
        </View>
      </Modal>
    </SafeIOSContainer>
  );
}

const SectionSelector = ({ onSelectItem }: { onSelectItem: (categoty: Movie[]) => void }) => {
  const { data } = useGetLandingPageMoviesQuery({ skip: 0, take: 15 });

  return (
    <FlatList
      numColumns={2}
      data={data}
      contentContainerStyle={{ gap: 10, padding: 10, paddingBottom: 50 }}
      style={{ flex: 1, marginBottom: 200 }}
      renderItem={({ item }) => (
        <TouchableRipple
          onPress={() => onSelectItem(item.results)}
          style={{
            marginRight: 10,
            width: Dimensions.get("window").width / 2 - 15,
            backgroundColor: MD2DarkTheme.colors.surface,
            height: 100,
          }}
        >
          <ImageBackground
            blurRadius={2}
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
                textShadowOffset: { width: 1, height: 2 },
                textShadowRadius: 3,
              }}
            >
              {item.name}
            </Text>
          </ImageBackground>
        </TouchableRipple>
      )}
      keyExtractor={(item) => item.name}
    />
  );
};
