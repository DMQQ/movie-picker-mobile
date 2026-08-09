import { StyleSheet, View } from "react-native";
import Text from "../../Text";

import { Movie } from "../../../../types";
import useTranslation from "../../../service/useTranslation";
import WatchProviders from "../WatchProviders";
import { memo } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { fontSize, spacing } from "../../../constants/design";

interface DetailsTabProps {
  movie: Movie & Record<string, string>;
  providers: any[];
}

function DetailsTab({ movie, providers }: DetailsTabProps) {
  const t = useTranslation();

  return (
    <View style={styles.container}>
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

      {providers && <WatchProviders providers={providers as any} />}
    </View>
  );
}

export default memo(DetailsTab);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
    minHeight: 400,
  },

  overview: {
    fontSize: fontSize.xl + 1,
    color: "rgba(255,255,255,0.95)",
    marginBottom: spacing.sm + 2,
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm + 2,
    marginBottom: spacing.sm + 2,
  },
  text: {
    fontSize: fontSize.md + 1,
    color: "rgba(255,255,255,0.6)",
  },
});
