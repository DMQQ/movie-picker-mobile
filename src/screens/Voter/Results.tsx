import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import IconButton from "../../components/IconButton";
import Text from "../../components/Text";
import { fontWeight, fontSize, radius, spacing } from "../../constants/design";

import PrimaryButton from "../../components/PrimaryButton";
import { ImageBackground } from "react-native";
import { router } from "expo-router";
import { Pressable } from "react-native-gesture-handler";
import QuickActions from "../../components/QuickActions";
import { useMovieVoter } from "../../service/useVoter";
import ReviewManager from "../../utils/rate";
import useTranslation from "../../service/useTranslation";

const scaleTitle = (title: string, size = 30) => {
  if (title.length > 30) return size * 0.75;
  if (title.length > 20) return size * 0.85;
  return size;
};

export default function Results() {
  const { sessionResults } = useMovieVoter();
  const t = useTranslation();

  if (!sessionResults) {
    return (
      <View style={styles.center}>
        <Text>{t("voter.overview.loading")}</Text>
      </View>
    );
  }

  if (!sessionResults.topPicks.length) {
    return (
      <View style={styles.center}>
        <Text>{t("voter.overview.no-matches")}</Text>
        <PrimaryButton onPress={() => router.dismissAll()} style={styles.button}>
          {t("voter.home.quit")}
        </PrimaryButton>
      </View>
    );
  }

  const card = sessionResults?.selectedMovie;

  return (
    <ImageBackground
      blurRadius={5}
      source={{ uri: "https://image.tmdb.org/t/p/w500" + card?.backdrop_path }}
      style={{ flex: 1, ...StyleSheet.absoluteFill }}
    >
      <View
        style={{
          padding: spacing.sm + 2,
          height: 80,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.sm + 2,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <IconButton
          style={{ position: "absolute", left: 10, top: 10, zIndex: 100 }}
          icon="chevron-left"
          onPress={() => router.dismissAll()}
          size={28}
        />
        <Text
          style={{
            fontSize: 30,
            fontFamily: "Bebas",
            width: "100%",
            textAlign: "center",
          }}
        >
          {t("voter.overview.title")} 🎬
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.2)",
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.screen,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", gap: spacing.screen }}>
            <Pressable
              disabled={!card?.id}
              onPress={() =>
                router.push({
                  pathname: "/movie/type/[type]/[id]",
                  params: {
                    id: card?.id as unknown as string,
                    type: card?.title ? "movie" : "tv",
                    img: card?.poster_path,
                  },
                })
              }
            >
              <Image
                source={{
                  uri: "https://image.tmdb.org/t/p/w500" + card?.poster_path,
                }}
                style={{
                  width: (Dimensions.get("window").width - 30) / 2 - 60,
                  height: 215,
                  borderRadius: radius.sm + 2,
                }}
              />
            </Pressable>
            <View
              style={{
                flex: 1,
                gap: spacing.sm + 2,
                justifyContent: "space-between",
                paddingVertical: spacing.screen,
              }}
            >
              <Text
                style={{
                  fontSize: scaleTitle((card?.title || card?.name)! as string, 30),
                  fontFamily: "Bebas",
                }}
              >
                {card?.title || card?.name}
              </Text>
              <Text style={{ width: "100%", marginBottom: spacing.sm + 2 }}>
                ★{card?.vote_average.toFixed(2)}/10 {card?.release_date} |{" "}
                {card?.original_language}
              </Text>
              {card && <QuickActions movie={card} />}
            </View>
          </View>

          <Text
            style={{
              marginTop: spacing.sm + 2,
              color: "rgba(255,255,255,0.9)",
              fontSize: fontSize.md + 1,
              fontWeight: fontWeight.medium,
            }}
          >
            {card?.overview}
          </Text>

          <View style={{ marginTop: spacing.xxl + 6 }}>
            <Text style={{ fontSize: 30, fontFamily: "Bebas", marginBottom: spacing.screen }}>
              {t("voter.overview.h2")}
            </Text>
            {sessionResults?.topPicks?.slice(1).map((item) => (
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!item.movie.id}
                key={item.movie.id}
                style={{
                  marginBottom: spacing.screen,
                  width: Dimensions.get("screen").width - 30,
                  overflow: "hidden",
                }}
                onPress={() =>
                  router.push({
                    pathname: "/movie/type/[type]/[id]",
                    params: {
                      id: item.movie.id,
                      type: item?.movie?.title ? "movie" : "tv",
                      img: item.movie.poster_path,
                    },
                  })
                }
              >
                <View style={{ flexDirection: "row", gap: spacing.screen }}>
                  <Image
                    source={{
                      uri: "https://image.tmdb.org/t/p/w200" + item.movie.poster_path,
                    }}
                    style={{ width: 80, height: 120, borderRadius: radius.xs + 1 }}
                  />
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        height: 45,
                      }}
                    >
                      <Text style={{ fontSize: 30, fontFamily: "Bebas" }}>
                        {item?.movie?.title || item?.movie?.name}
                      </Text>
                    </View>
                    <View>
                      <Text>★ {item.movie.vote_average.toFixed(2)}/10 </Text>
                      <Text numberOfLines={3} textBreakStrategy="simple">
                        {item.movie.release_date} | {item.movie.original_language} |{" "}
                        {item?.movie?.overview}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PrimaryButton
          onPress={() => {
            ReviewManager.onGameComplete(true);
            router.dismissAll();
          }}
          style={[styles.button, { marginBottom: spacing.screen }]}
        >
          {t("voter.home.quit")}
        </PrimaryButton>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: spacing.screen,
    borderRadius: radius.pill,
  },
});
