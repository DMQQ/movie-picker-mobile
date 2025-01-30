import { Dimensions, Image, ImageBackground, Platform, Pressable, StyleSheet, View, VirtualizedList } from "react-native";
import { Avatar, Button, IconButton, MD2DarkTheme, Text } from "react-native-paper";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";
import { ScreenProps } from "./types";
import { useGetFeaturedQuery, useLazyGetLandingPageMoviesQuery, useLazyGetSectionMoviesQuery } from "../redux/movie/movieApi";
import SafeIOSContainer from "../components/SafeIOSContainer";
import ScoreRing from "../components/ScoreRing";
import { Movie } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AppLoadingOverlay from "../components/AppLoadingOverlay";
import { loadFavorites } from "../redux/favourites/favourites";

const { width, height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginTop: Platform.OS === "ios" ? 40 : 0,
  },

  featuredImage: {
    width,
    height: height / 1.25,
    position: "relative",
    marginBottom: 35,
  },

  gradientContainer: { flex: 1, padding: 10, position: "absolute", bottom: 0, width },

  overview: { fontSize: 14, color: "rgba(255,255,255,0.95)", fontWeight: "500" },
});

const gradient = ["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.8)", "#000000"] as any;

const keyExtractor = (item: { name: string }) => item.name;

const getItemCount = (data: { name: string; results: Movie[] }[]) => data.length;

const getItem = (data: { name: string; results: Movie[] }[], index: number) => data[index];

export default function Landing({ navigation }: ScreenProps<"Landing">) {
  const [page, setPage] = useState(0);

  const [data, setData] = useState<{ name: string; results: Movie[] }[]>([]);

  const [getLandingMovies] = useLazyGetLandingPageMoviesQuery();

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

  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      const nickname = (await AsyncStorage.getItem("nickname")) || "Guest";
      const language = (await AsyncStorage.getItem("language")) || "en";

      dispatch(roomActions.setSettings({ nickname, language }));

      dispatch(loadFavorites());
    })();
  }, []);

  const onEndReached = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const renderItem = useCallback(({ item: group }: { item: { name: string; results: Movie[] } }) => <Section group={group} />, []);

  return (
    <SafeIOSContainer style={{ marginTop: 0 }}>
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
    </SafeIOSContainer>
  );
}

const FeaturedSection = memo(
  (props: { navigate: any }) => {
    const { data: featured } = useGetFeaturedQuery();

    const { nickname } = useAppSelector((state) => state.room);

    return (
      <ImageBackground
        style={styles.featuredImage}
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + featured?.poster_path,
        }}
      >
        <View style={[styles.header]}>
          <Pressable onPress={() => props.navigate("Settings")} style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
            <Avatar.Text size={30} label={nickname?.[0]?.toUpperCase()} color="#fff" />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Hello {nickname}.</Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <IconButton icon="heart" iconColor="#fff" size={28} onPress={() => props.navigate("Favourites")} />
            <ScoreRing score={featured?.vote_average || 0} />
          </View>
        </View>

        <LinearGradient style={styles.gradientContainer} colors={gradient}>
          <Text style={{ fontSize: 50, fontFamily: "Bebas" }} numberOfLines={2}>
            {featured?.title || featured?.name}
          </Text>
          <Text numberOfLines={8} style={styles.overview}>
            {featured?.overview}
          </Text>
        </LinearGradient>
      </ImageBackground>
    );
  },
  () => true
);

const BottomTab = memo(
  ({ navigate }: { navigate: any }) => {
    return (
      <View style={{ paddingHorizontal: 15, flexDirection: "row", alignItems: "center" }}>
        <Button
          mode="contained-tonal"
          onPress={() => navigate("QRScanner")}
          style={{ marginTop: 15, borderRadius: 100, marginBottom: 15, flex: 1 }}
          contentStyle={{ padding: 7.5 }}
        >
          Join a game
        </Button>

        <View style={{ flexDirection: "row", gap: 5 }}>
          <IconButton
            size={30}
            onPress={() => navigate("FortuneWheel")}
            icon={"dice-6"}
            style={{ backgroundColor: MD2DarkTheme.colors.primary }}
          />
          <IconButton size={30} onPress={() => navigate("QRCode")} icon={"plus"} style={{ backgroundColor: MD2DarkTheme.colors.primary }} />
        </View>
      </View>
    );
  },
  () => true
);

interface SectionProps {
  group: { name: string; results: Movie[] };
}

const sectionStyles = StyleSheet.create({
  container: { marginBottom: 20, padding: 15, height: height * 0.275 + 100 },
  title: { color: "#fff", fontSize: 45, marginBottom: 20, fontFamily: "Bebas" },
  list: {
    flex: 1,
    height: height * 0.275,
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

  const snapToOffsets = useMemo(() => movies.map((_, index) => index * width * 0.375 + index * 20 - 5), [movies.length]);

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
        <View style={{ position: "absolute", right: 25, bottom: 5 }}>
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
        snapToOffsets={snapToOffsets}
        snapToAlignment="start"
        decelerationRate="fast"
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
