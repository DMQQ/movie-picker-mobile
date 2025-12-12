import { Platform, StyleSheet, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { Movie } from "../../../types";
import useTranslation from "../../service/useTranslation";
import CustomFavourite from "../Favourite";
import QuickActions from "../QuickActions";
import RatingIcons from "../RatingIcons";
import PlatformBlurView, { BlurViewWrapper } from "../PlatformBlurView";
import { useGetMovieProvidersQuery, useGetSimilarQuery, useGetTrailersQuery } from "../../redux/movie/movieApi";
import { memo, useMemo } from "react";
import MovieTabs from "./MovieTabs";

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
    {
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
      skip: !params.id || !params.type,
    }
  );

  const { data: similarData } = useGetSimilarQuery(
    {
      id: Number(params.id),
      type: params.type as "movie" | "tv",
      page: 1,
    },
    {
      skip: !params.id || !params.type,
    }
  );

  const { data: trailersData } = useGetTrailersQuery(
    {
      id: Number(params.id),
      type: params.type,
    },
    {
      skip: !params.id || !params.type,
    }
  );

  const hasSimilar = useMemo(() => {
    return (similarData?.results && similarData.results.length > 0) ?? false;
  }, [similarData]);

  const hasTrailers = useMemo(() => {
    return (trailersData && trailersData.length > 0) ?? false;
  }, [trailersData]);

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

  const isTVShow = type === "tv";

  const tabs = useMemo(() => {
    const baseTabs = [
      { key: "details", title: t("movie.tabs.details") || "Details" },
      { key: "cast", title: t("movie.tabs.cast") || "Cast" },
    ];

    if (hasSimilar) {
      baseTabs.push({
        key: "similar",
        title: t("movie.tabs.similar") || "Similar",
      });
    }

    if (hasTrailers) {
      baseTabs.push({
        key: "trailers",
        title: t("movie.tabs.trailers") || "Trailers",
      });
    }

    if (isTVShow) {
      baseTabs.push({
        key: "seasons",
        title: t("movie.tabs.seasons") || "Seasons",
      });
    }

    return baseTabs;
  }, [isTVShow, t, hasSimilar, hasTrailers]);

  return (
    <Animated.View entering={FadeIn}>
      <BlurViewWrapper style={styles.blurWrapper}>
        <Text style={styles.heading}>{movie?.title || movie?.name || "-"}</Text>

        {!!movie?.tagline && <Text style={styles.tagline}>{movie?.tagline ? `"${movie?.tagline}"` : ""}</Text>}

        <View style={styles.rating}>
          <RatingIcons size={20} vote={movie?.vote_average} />
        </View>

        <Text style={styles.categories}>{data.join(" | ")}</Text>

        <View style={{ paddingVertical: 15 }}>
          <PlatformBlurView style={styles.quickActions}>
            <QuickActions movie={movie}>
              <View style={{ flex: 1 }}>
                <CustomFavourite movie={movie} />
              </View>
            </QuickActions>
          </PlatformBlurView>
        </View>

        <MovieTabs
          movie={movie}
          type={type}
          providers={providers}
          tabs={tabs}
          isTVShow={isTVShow}
          hasSimilar={hasSimilar}
          hasTrailers={hasTrailers}
        />

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

  quickActions: {
    paddingVertical: 20,
    paddingLeft: 5,
    borderRadius: 20,
  },

  text: { fontSize: 15, color: "rgba(255,255,255,0.6)" },

  attributions: { padding: 20, justifyContent: "center", height: 100 },
});
