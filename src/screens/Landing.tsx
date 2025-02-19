import { Dimensions, Image, ImageBackground, Pressable, StyleSheet, TouchableHighlight, View, VirtualizedList } from "react-native";
import { Avatar, MD2DarkTheme, Text } from "react-native-paper";
import { memo, useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../redux/store";
import { ScreenProps } from "./types";
import { useGetFeaturedQuery, useLazyGetLandingPageMoviesQuery, useLazyGetSectionMoviesQuery } from "../redux/movie/movieApi";
import ScoreRing from "../components/ScoreRing";
import { Movie } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AppLoadingOverlay from "../components/AppLoadingOverlay";
import useTranslation from "../service/useTranslation";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const { width, height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    padding: 5,
  },

  featuredImage: {
    width,
    height: height / 1.3,
    position: "relative",
    marginBottom: 35,
  },

  gradientContainer: { flex: 1, padding: 10, position: "absolute", bottom: 0, width, paddingTop: 30 },

  overview: { fontSize: 16, color: "rgba(255,255,255,0.95)", fontWeight: "500" },
});

const gradient = ["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.8)", "#000000"] as any;

const keyExtractor = (item: { name: string }) => item.name;

const getItemCount = (data: { name: string; results: Movie[] }[]) => data.length;

const getItem = (data: { name: string; results: Movie[] }[], index: number) => data[index];

export default function Landing({ navigation }: ScreenProps<"Landing">) {
  const [page, setPage] = useState(0);

  const [data, setData] = useState<{ name: string; results: Movie[] }[]>([]);

  const [getLandingMovies, { error }] = useLazyGetLandingPageMoviesQuery();

  useEffect(() => {
    getLandingMovies({ skip: page * 3, take: 5 }).then((response) => {
      if (response.data && Array.isArray(response.data)) {
        setData((prev) => {
          const uniqueSections = (response.data || []).filter(
            (newSection) => !prev.some((existingSection) => existingSection.name === newSection.name)
          );
          return [...prev, ...uniqueSections];
        });
      }
    });
  }, [page]);

  const onEndReached = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const renderItem = useCallback(({ item: group }: { item: { name: string; results: Movie[] } }) => <Section group={group} />, []);

  return (
    <View style={{ flex: 1 }}>
      <AppLoadingOverlay />

      <VirtualizedList
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews={true}
        style={{ flex: 1 }}
        ListHeaderComponent={<FeaturedSection navigate={navigation.navigate} />}
        data={(data || []) as { name: string; results: Movie[] }[]}
        initialNumToRender={3}
        keyExtractor={keyExtractor}
        getItemCount={getItemCount}
        getItem={getItem}
        onEndReached={onEndReached}
        renderItem={renderItem}
        onEndReachedThreshold={0.5}
      />

      <BottomTab navigate={navigation.navigate} />
    </View>
  );
}

const FeaturedSection = memo(
  (props: { navigate: any }) => {
    const { data: featured, error } = useGetFeaturedQuery();

    const { nickname } = useAppSelector((state) => state.room);
    const navigation = useNavigation<any>();
    const t = useTranslation();

    const onPress = () => {
      navigation.navigate("MovieDetails", {
        id: featured?.id,
        type: featured?.type,
        img: featured?.poster_path,
      });
    };

    const details = [
      featured?.vote_average && featured?.vote_average?.toFixed(1) + "/10",
      featured?.release_date || featured?.first_air_date,
      ((featured?.title || featured?.name) === (featured?.original_title || featured?.original_name) && featured?.original_title) ||
        featured?.original_name,
      ...(featured?.genres || []),
    ]
      .filter(Boolean)
      .join(" | ");

    return (
      <ImageBackground
        style={styles.featuredImage}
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + featured?.poster_path,
        }}
        resizeMode="cover"
        resizeMethod="scale"
      >
        <LinearGradient style={styles.gradientContainer} colors={gradient}>
          <Pressable onPress={onPress}>
            <Text style={{ fontSize: 40, fontFamily: "Bebas", lineHeight: 50 }} numberOfLines={2}>
              {featured?.title || featured?.name}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.9)", marginBottom: 10 }}>{details}</Text>
            <Text numberOfLines={7} style={styles.overview}>
              {featured?.overview}
            </Text>
          </Pressable>
        </LinearGradient>
      </ImageBackground>
    );
  },
  () => true
);

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    padding: 10,
    paddingTop: 10,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 7.5,
    borderRadius: 100,
  },
});

const BottomTab = memo(
  ({ navigate }: { navigate: any }) => {
    const t = useTranslation();

    return (
      <View style={tabStyles.container}>
        <TouchableHighlight
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          onPress={() => navigate("Settings")}
          style={tabStyles.button}
        >
          <FontAwesome name="gear" size={25} color="#fff" />
        </TouchableHighlight>

        <TouchableHighlight
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          style={tabStyles.button}
          onPress={() => navigate("Favourites")}
        >
          <FontAwesome name="bookmark" size={25} color="#fff" />
        </TouchableHighlight>

        <TouchableHighlight
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          style={[tabStyles.button, { backgroundColor: MD2DarkTheme.colors.primary, borderRadius: 10, padding: 5, paddingVertical: 10 }]}
          onPress={() =>
            navigate("QRCode", {
              screen: "QRScanner",
            })
          }
        >
          <FontAwesome name="qrcode" size={30} color={"#fff"} />
        </TouchableHighlight>

        <TouchableHighlight
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          style={tabStyles.button}
          onPress={() => navigate("Games")}
        >
          <FontAwesome name="gamepad" size={25} color="#fff" />
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => navigate("Search")}
          activeOpacity={0.8}
          underlayColor={MD2DarkTheme.colors.surface}
          style={tabStyles.button}
        >
          <FontAwesome name="search" size={25} color="#fff" />
        </TouchableHighlight>
      </View>
    );
  },
  () => true
);

interface SectionProps {
  group: { name: string; results: Movie[] };
}

const sectionStyles = StyleSheet.create({
  container: { marginBottom: 20, padding: 15, minHeight: height * 0.275 + 100 },
  title: { color: "#fff", fontSize: 45, marginBottom: 20, fontFamily: "Bebas" },
  list: {
    flex: 1,
    minHeight: height * 0.275,
  },
  listContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },

  image: {
    width: width * 0.375,
    height: height * 0.275,
    borderRadius: 15,
    marginRight: 20,
  },
});

const getSectionItem = (data: any, index: number) => data[index];
const getSectionItemCount = (data: any) => data.length;

const keySectionExtractor = (item: any, index: number) => item.id.toString() + "-" + index;

const Section = memo(({ group }: SectionProps) => {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const [getSectionMovies, state] = useLazyGetSectionMoviesQuery();

  const [movies, setSectionMovies] = useState<Movie[]>(() => group.results);

  const onEndReached = useCallback(() => {
    if (state.isLoading || !!state.error) return;
    setPage((prev) => prev + 1);
  }, [state.isLoading, state.error]);

  useEffect(() => {
    if (page === 1) return;

    getSectionMovies({ name: group.name, page }).then((response) => {
      if (response.data && Array.isArray(response.data.results)) {
        setSectionMovies((prev) => prev.concat(response?.data?.results || []));
      }
    });
  }, [page]);

  const renderItem = useCallback(
    ({ item }: { item: Movie & { type: string } }) => (
      <Pressable
        onPress={() =>
          navigation.navigate("MovieDetails", {
            id: item.id,
            type: item.type,
            img: item.poster_path,
          })
        }
        style={{
          position: "relative",
        }}
      >
        <Image
          resizeMode="cover"
          style={sectionStyles.image}
          source={{
            uri: "https://image.tmdb.org/t/p/w200" + item.poster_path,
          }}
        />
        <View style={{ position: "absolute", right: 30, bottom: 10 }}>
          <ScoreRing score={item.vote_average} />
        </View>
      </Pressable>
    ),
    []
  );

  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{group.name}</Text>
      <VirtualizedList
        initialNumToRender={5} // Increased from 3
        maxToRenderPerBatch={3} // Reduced from 5
        updateCellsBatchingPeriod={50} // Add this
        windowSize={2}
        removeClippedSubviews={true}
        getItem={getSectionItem}
        getItemCount={getSectionItemCount}
        onEndReached={onEndReached}
        data={(movies || []) as any}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keySectionExtractor}
        style={sectionStyles.list}
        contentContainerStyle={sectionStyles.listContainer}
        renderItem={renderItem}
        onEndReachedThreshold={0.5}
        maintainVisibleContentPosition={{
          // Add this
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </View>
  );
});
