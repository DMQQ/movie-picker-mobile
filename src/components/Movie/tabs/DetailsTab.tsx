import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Movie } from "../../../../types";
import useTranslation from "../../../service/useTranslation";
import WatchProviders from "../WatchProviders";
import { memo } from "react";
import { ScrollView } from "react-native-gesture-handler";

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
    paddingHorizontal: 15,
    paddingTop: 15,
    minHeight: 400,
  },

  overview: {
    fontSize: 19,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 10,
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
  },
});
