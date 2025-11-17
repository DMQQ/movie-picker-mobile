import { Platform, StyleSheet, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { Movie } from "../../../types";
import useTranslation from "../../service/useTranslation";
import CustomFavourite from "../Favourite";
import FrostedGlass from "../FrostedGlass";
import QuickActions from "../QuickActions";
import RatingIcons from "../RatingIcons";
import Similar from "../Similar";
import Cast from "./Cast";
import Seasons from "./SeasonsList";
import WatchProviders from "./WatchProviders";
import { BlurViewWrapper } from "../PlatformBlurView";
import { useGetMovieProvidersQuery } from "../../redux/movie/movieApi";
import { memo, useMemo } from "react";

function MovieDetails({
  movie,
  type,
  params,
}: {
  movie: Movie & Record<string, string>;

  type: string;

  params: {
    id: string;
    type: string;
  };
}) {
  const t = useTranslation();

  const { data: providers = [] } = useGetMovieProvidersQuery(
    {
      id: Number(params.id),
      type: params.type,
    },
    { refetchOnReconnect: true, refetchOnMountOrArgChange: true, skip: !params.id || !params.type }
  );

  const data = useMemo(
    () =>
      [
        movie?.release_date || movie?.first_air_date,
        (movie?.title || movie?.name) === (movie?.original_title || movie?.original_name)
          ? null
          : movie?.original_title || movie?.original_name,
        ...(movie?.genres || [])?.map((g: any) => g.name),
      ].filter((v) => v !== undefined && v !== "" && v !== null) as string[],
    [movie]
  );

  return (
    <Animated.View style={{ flex: 1 }} entering={FadeIn}>
      <BlurViewWrapper style={styles.blurWrapper}>
        <Text style={styles.heading}>{movie?.title || movie?.name || "-"}</Text>

        {!!movie?.tagline && <Text style={styles.tagline}>{movie?.tagline ? `"${movie?.tagline}"` : ""}</Text>}

        <View style={styles.rating}>
          <RatingIcons size={20} vote={movie?.vote_average} />
        </View>

        <Text style={styles.categories}>{data.join(" | ")}</Text>

        <View style={{ paddingVertical: 15 }}>
          <FrostedGlass style={styles.quickActions}>
            <QuickActions movie={movie}>
              <View style={{ flex: 1 }}>
                <CustomFavourite movie={movie} />
              </View>
            </QuickActions>
          </FrostedGlass>
        </View>

        {!!movie?.overview && <Text style={styles.overview}>{movie?.overview}</Text>}

        <View style={styles.info}>
          {!!movie?.runtime && (
            <Text style={styles.text}>
              {t("movie.details.runtime")}: {movie?.runtime} {t("movie.details.minutes")}
            </Text>
          )}

          {!!movie?.status && (
            <Text style={styles.text}>
              {t("movie.details.status")}: {movie?.status}
            </Text>
          )}
        </View>

        {providers && <WatchProviders providers={(providers || []) as any} />}

        <Cast id={movie?.id} type={type as "movie" | "tv"} />

        {type === "tv" && <Seasons id={movie?.id} seasons={(movie?.seasons as any) || []} />}

        <Similar id={movie?.id} type={type as "movie" | "tv"} />

        <View style={styles.attributions}>
          <Text style={[styles.text, { textAlign: "center" }]}>{t("global.attributions")}</Text>
        </View>
      </BlurViewWrapper>
    </Animated.View>
  );
}

export default memo(MovieDetails);

const styles = StyleSheet.create({
  blurWrapper: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface + "cc",

        borderWidth: 2,
        borderColor: "#343434ff",
      },
    }),

    padding: 15,
  },

  heading: {
    fontSize: 50,
    fontFamily: "Bebas",
    lineHeight: 55,
    marginTop: 10,
  },

  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 10,
  },

  categories: { color: "rgba(255,255,255,0.7)", fontSize: 15 },

  rating: { flexDirection: "row", marginBottom: 10 },

  quickActions: { paddingVertical: 20, paddingLeft: 5 },

  overview: {
    fontSize: 19,
    color: "rgba(255,255,255,0.95)",
  },

  info: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },

  text: { fontSize: 15, color: "rgba(255,255,255,0.6)" },

  attributions: { padding: 20, justifyContent: "center", height: 100 },
});
