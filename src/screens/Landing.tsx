import { Dimensions, Image, ImageBackground, Pressable, ScrollView, StyleSheet, View, VirtualizedList } from "react-native";
import { Avatar, Button, IconButton, Text } from "react-native-paper";

import { useCallback, useEffect, useState } from "react";
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

const { width, height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
});

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

  const { nickname } = useAppSelector((state) => state.room);

  useEffect(() => {
    (async () => {
      const nickname = (await AsyncStorage.getItem("nickname")) || "Guest";
      const language = (await AsyncStorage.getItem("language")) || "en";

      dispatch(roomActions.setSettings({ nickname, language }));
    })();
  }, []);

  const setSectionMovies = useCallback(
    (name: string, movies: Movie[]) => {
      setData((prev) => {
        const sectionIndex = prev.findIndex((section) => section.name === name);

        if (sectionIndex === -1) return data;

        const newData = [...prev];

        newData[sectionIndex] = { name, results: [...newData[sectionIndex].results, ...movies] };

        return newData;
      });
    },
    [data.length]
  );

  const { data: featured, refetch } = useGetFeaturedQuery();

  return (
    <SafeIOSContainer>
      <View style={{ flex: 1 }}>
        {/* <View style={styles.header}>
          <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
            <Avatar.Text size={30} label={nickname?.[0]?.toUpperCase()} color="#fff" />
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Hello {nickname}.</Text>
          </View>

          <IconButton icon={"dots-horizontal"} onPress={() => navigation.navigate("Settings")} />
        </View> */}

        <VirtualizedList
          ListHeaderComponent={
            <ImageBackground
              style={{
                width,
                height: height / 1.6,
                position: "relative",
                marginBottom: 50,
              }}
              source={{
                uri: "https://image.tmdb.org/t/p/w500" + featured?.poster_path,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width,
                  padding: 20,
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <IconButton background={"#000"} icon={"refresh"} iconColor="#fff" onPress={refetch} />
                <ScoreRing score={featured?.vote_average || 0} />
              </View>
              <Pressable
                onPress={() =>
                  navigation.navigate("MovieDetails", {
                    id: featured?.id!,
                    type: featured?.title ? "movie" : "tv",
                    img: featured?.poster_path,
                  })
                }
                style={{ position: "absolute", bottom: 0, width }}
              >
                <LinearGradient
                  style={{ flex: 1, padding: 10 }}
                  colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)", "#000000"]}
                >
                  <Text style={{ fontSize: 50, fontFamily: "Bebas" }}>{featured?.title || featured?.name}</Text>
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>{featured?.overview}</Text>
                </LinearGradient>
              </Pressable>
            </ImageBackground>
          }
          data={(data || []) as { name: string; results: Movie[] }[]}
          initialNumToRender={1}
          keyExtractor={(item) => item.name as string}
          getItemCount={(dt) => dt.length}
          getItem={(data, index) => data[index] as { name: string; results: Movie[] }}
          onEndReached={() => setPage((prev) => prev + 1)}
          renderItem={({ item: group }: { item: { name: string; results: Movie[] } }) => (
            <Section setSectionMovies={setSectionMovies} group={group} />
          )}
        />
      </View>

      <View style={{ paddingHorizontal: 15, flexDirection: "row", alignItems: "center" }}>
        <Button
          mode="contained-tonal"
          onPress={() => navigation.navigate("QRScanner")}
          style={{ marginTop: 15, borderRadius: 100, marginBottom: 15, flex: 1 }}
          contentStyle={{ padding: 7.5 }}
        >
          Join a game
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate("QRCode")}
          style={{ borderRadius: 100, flex: 1 }}
          contentStyle={{ padding: 7.5 }}
        >
          Create a game
        </Button>
      </View>
    </SafeIOSContainer>
  );
}

interface SectionProps {
  group: { name: string; results: Movie[] };

  setSectionMovies: (name: string, movies: Movie[]) => void;
}

const Section = ({ group, setSectionMovies }: SectionProps) => {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(1);
  const [getSectionMovies, state] = useLazyGetSectionMoviesQuery();

  const onEndReached = () => {
    if (state.isLoading || !!state.error) {
      console.log("onEndReached", state.isLoading, state.error);
      return;
    }
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1)
      getSectionMovies({ name: group.name, page }).then((response) => {
        if (response.data && Array.isArray(response.data.results)) {
          console.log("getSectionMovies call made", group.name);
          setSectionMovies(group.name, response.data.results);
        }
      });
  }, [page]);

  return (
    <View style={{ marginBottom: 20, padding: 15 }} key={group.name}>
      <Text style={{ color: "#fff", fontSize: 40, marginBottom: 25, fontFamily: "Bebas" }}>{group.name}</Text>
      <VirtualizedList
        getItem={(data, index) => data[index]}
        getItemCount={(data) => data.length}
        onEndReached={onEndReached}
        data={(group.results || []) as any}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item.id.toString() + "-" + index}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          justifyContent: "flex-start",
          alignItems: "center",
        }}
        initialNumToRender={3}
        snapToOffsets={group?.results?.map((_, index) => index * width * 0.4 + index * 20 - 5)}
        snapToAlignment="start"
        decelerationRate="fast"
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("MovieDetails", {
                id: item.id,
                type: item.type,
                img: item.poster_path,
              })
            }
            key={item.id}
            style={{
              position: "relative",
            }}
          >
            <Image
              resizeMode="cover"
              style={{
                width: width * 0.4,
                height: height * 0.3,
                borderRadius: 15,
                marginRight: 20,
              }}
              source={{
                uri: "https://image.tmdb.org/t/p/w500" + item.poster_path,
              }}
            />
            <View style={{ position: "absolute", right: 25, bottom: 5 }}>
              <ScoreRing score={item.vote_average} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};
