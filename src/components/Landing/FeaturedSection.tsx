import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect } from "react";
import { Dimensions, ImageBackground, Platform, Pressable, StyleSheet, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useGetFeaturedQuery, useLazyGetFeaturedQuery } from "../../redux/movie/movieApi";
import FrostedGlass from "../FrostedGlass";
import RatingIcons from "../RatingIcons";
import { prefetchThumbnail, ThumbnailSizes } from "../Thumbnail";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PlatformBlurView from "../PlatformBlurView";

const { width, height } = Dimensions.get("screen");

const gradient = ["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.8)", "#000000"] as any;

const FeaturedSection = (props: { navigate: any; selectedChip: string }) => {
  const [getFeatured, { data: featured, error }] = useLazyGetFeaturedQuery();

  useEffect(() => {
    getFeatured({ selectedChip: props.selectedChip || "all" });
    console.log("fetching featured with chip:", props.selectedChip);
  }, [props.selectedChip]);

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const onPress = () => {
    navigation.navigate("MovieDetails", {
      id: featured?.id,
      type: featured?.type,
      img: featured?.poster_path,
    });
  };

  const details = [
    featured?.release_date || featured?.first_air_date,
    ((featured?.title || featured?.name) === (featured?.original_title || featured?.original_name) && featured?.original_title) ||
      featured?.original_name,
    ...(featured?.genres || []),
  ]
    .filter(Boolean)
    .join(" | ");

  useEffect(() => {
    if (!featured?.poster_path) return;

    prefetchThumbnail(featured?.poster_path, ThumbnailSizes.poster.xxlarge);
  }, [featured?.poster_path]);

  if (!featured || error) return null;

  return (
    <ImageBackground
      style={[styles.featuredImage, Platform.OS === "ios" ? { marginTop: -insets.top - 40 } : { marginTop: insets.top - 15 }]}
      source={{
        uri: "https://image.tmdb.org/t/p/w780" + featured?.poster_path,
      }}
      defaultSource={{ uri: featured?.placeholder_poster_path }}
    >
      <LinearGradient style={styles.gradientContainer} colors={gradient}>
        <Animated.View entering={FadeInDown.delay(250)}>
          <Pressable onPress={onPress}>
            <PlatformBlurView
              style={{
                padding: 15,
                borderBottomWidth: 0,
                ...Platform.select({
                  android: {
                    borderWidth: 2,
                    borderColor: "#343434ff",
                    backgroundColor: MD2DarkTheme.colors.surface + "cc",
                    borderRadius: 35,
                  },
                }),
              }}
            >
              <Text style={{ fontSize: 40, fontFamily: "Bebas", lineHeight: 50 }} numberOfLines={2}>
                {featured?.title || featured?.name}
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 10 }}>
                <RatingIcons vote={featured?.vote_average} size={20} />
              </View>
              <Text style={{ color: "rgba(255,255,255,0.9)", marginBottom: 10 }}>{details}</Text>
              <Text numberOfLines={7} style={styles.overview}>
                {featured?.overview}
              </Text>
            </PlatformBlurView>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  );
};

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
    height: height / 1.3 + 70,
    position: "relative",
    marginBottom: 35,
    ...(Platform.OS === "android" ? { height: height / 1.4 + 15 } : {}),
  },

  gradientContainer: { flex: 1, position: "absolute", bottom: 0, width, paddingTop: 30 },

  overview: { fontSize: 16, color: "rgba(255,255,255,0.95)", fontWeight: "500" },
});
export default FeaturedSection;
