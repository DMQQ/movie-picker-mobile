import { Platform, StyleSheet, View } from "react-native";
import Text from "../Text";
import { Image } from "expo-image";

import { Movie, MovieDetails as MovieDetailsType } from "../../../types";
import useTranslation from "../../service/useTranslation";
import CustomFavourite from "../Favourite";
import RateMovieButton from "../RateMovieButton";
import GenreChip from "../GenreChip";
import GenresView from "../GenresView";
import QuickActions from "../QuickActions";
import RatingIcons from "../RatingIcons";
import PlatformBlurView, { BlurViewWrapper } from "../PlatformBlurView";
import {
  useGetSimilarQuery,
  useGetTrailersQuery,
} from "../../redux/movie/movieApi";
import { useGetMovieKeyPeopleQuery } from "../../redux/person/personApi";
import { memo, useMemo } from "react";
import MovieTabs from "./MovieTabs";
import { colors, fontSize, radius, spacing } from "../../constants/design";

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

function MovieDetails({
  movie,
  type,
  providers,
  similarData,
  trailersData,
  castData,
}: MovieDetailsProps) {
  const t = useTranslation();

  const hasSimilar = useMemo(() => {
    return (similarData?.results && similarData.results.length > 0) ?? false;
  }, [similarData]);

  const hasTrailers = useMemo(() => {
    return (trailersData && trailersData.length > 0) ?? false;
  }, [trailersData]);

  const releaseYear = useMemo(
    () =>
      (movie?.release_date || movie?.first_air_date || "")?.split("-")[0] ||
      null,
    [movie],
  );

  const originalTitle = useMemo(
    () =>
      (movie?.title || movie?.name) !==
      (movie?.original_title || movie?.original_name)
        ? movie?.original_title || movie?.original_name
        : null,
    [movie],
  );

  const genres = useMemo(() => (movie?.genres || []).slice(0, 3), [movie]);

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
      <View
        style={{ width: "100%", alignItems: "center", padding: spacing.sm + 2 }}
      >
        <View
          style={{
            width: 60,
            height: 4,
            backgroundColor: colors.text,
            borderRadius: radius.sm + 2,
          }}
        />
      </View>
      <View style={{ padding: spacing.screen, paddingBottom: 0 }}>
        <Text numberOfLines={3} style={styles.heading}>
          {movie?.title || movie?.name || "-"}
        </Text>

        {!!movie?.tagline && (
          <Text style={styles.tagline}>
            {movie?.tagline ? `"${movie?.tagline}"` : ""}
          </Text>
        )}

        <View style={styles.rating}>
          <RatingIcons size={20} vote={movie?.vote_average} />
        </View>

        {(releaseYear || genres.length > 0) && (
          <View style={styles.chipsRow}>
            {releaseYear && <GenreChip genre={releaseYear} />}
            <GenresView genres={genres} />
          </View>
        )}

        {originalTitle && (
          <Text style={styles.categories}>{originalTitle}</Text>
        )}

        <View style={{ paddingVertical: spacing.md, gap: spacing.md }}>
          <PlatformBlurView style={styles.quickActions}>
            <QuickActions movie={movie}>
              <View style={{ flex: 1 }}>
                <CustomFavourite movie={movie} />
              </View>
            </QuickActions>
          </PlatformBlurView>
          <RateMovieButton movie={movie} contentType={type} />
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
        <Text style={[styles.text, { textAlign: "center" }]}>
          {t("global.attributions")}
        </Text>
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
        backgroundColor: colors.appBackground,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderWidth: 0,
      },
    }),
  },

  heading: {
    fontSize: 50,
    fontFamily: "Bebas",
    lineHeight: 55,
    marginTop: spacing.sm + 2,
  },

  tagline: {
    fontSize: fontSize.md + 1,
    color: "rgba(255,255,255,0.95)",
    marginBottom: spacing.sm + 2,
  },

  categories: { color: "rgba(255,255,255,0.7)", fontSize: fontSize.md + 1 },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm - 2,
    marginTop: spacing.sm,
  },

  rating: { flexDirection: "row", marginBottom: spacing.sm + 2 },

  quickActions: {
    paddingVertical: spacing.xl,
    paddingLeft: spacing.xs + 1,
    borderRadius: radius.modal,
  },

  text: { fontSize: fontSize.md + 1, color: "rgba(255,255,255,0.6)" },

  attributions: {
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs + 1,
  },

  tmdbLogo: { width: 40, height: 40 },
});
