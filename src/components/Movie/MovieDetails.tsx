import { Platform, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { MD2DarkTheme, Text } from "react-native-paper";
import { Movie, MovieDetails as MovieDetailsType } from "../../../types";
import useTranslation from "../../service/useTranslation";
import CustomFavourite from "../Favourite";
import QuickActions from "../QuickActions";
import RatingIcons from "../RatingIcons";
import PlatformBlurView, { BlurViewWrapper } from "../PlatformBlurView";
import { useGetSimilarQuery, useGetTrailersQuery } from "../../redux/movie/movieApi";
import { useGetMovieKeyPeopleQuery } from "../../redux/person/personApi";
import { memo, useMemo } from "react";
import MovieTabs from "./MovieTabs";

interface MovieDetailsProps {
  movie: Movie & Record<string, string>;

  providers?: any;

  type: string;

  params: {
    id: string;
    type: string;
  };

  similarData?: ReturnType<typeof useGetSimilarQuery>["data"];

  trailersData?: ReturnType<typeof useGetTrailersQuery>["data"];

  castData?: ReturnType<typeof useGetMovieKeyPeopleQuery>["data"];
}

function MovieDetails({ movie, type, providers, similarData, trailersData, castData }: MovieDetailsProps) {
  const t = useTranslation();

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
      ].filter((v) => v !== undefined && v !== "" && v !== null && typeof v === "string") as string[],
    [movie],
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
    <BlurViewWrapper style={styles.blurWrapper}>
      <View style={{ padding: 15 }}>
        <Text numberOfLines={3} style={styles.heading}>
          {movie?.title || movie?.name || "-"}
        </Text>

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
      </View>

      <MovieTabs
        movie={movie}
        type={type}
        providers={providers}
        tabs={tabs}
        isTVShow={isTVShow}
        hasSimilar={hasSimilar}
        hasTrailers={hasTrailers}
        similarData={similarData}
        trailersData={trailersData}
        castData={castData}
      />

      <View style={styles.attributions}>
        <Image
          source="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
          style={styles.tmdbLogo}
          contentFit="contain"
        />
        <Text style={[styles.text, { textAlign: "center" }]}>{t("global.attributions")}</Text>
      </View>
    </BlurViewWrapper>
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
    ...Platform.select({
      android: {
        backgroundColor: MD2DarkTheme.colors.surface + "cc",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#343434ff",
      },
    }),
  },

  text: { fontSize: 15, color: "rgba(255,255,255,0.6)" },

  attributions: { padding: 20, justifyContent: "center", alignItems: "center", gap: 5 },

  tmdbLogo: { width: 40, height: 40 },
});
