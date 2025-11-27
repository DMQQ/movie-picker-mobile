import { StyleSheet, View, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { Movie } from "../../../../types";
import useTranslation from "../../../service/useTranslation";
import WatchProviders from "../WatchProviders";
import { memo } from "react";

interface DetailsTabProps {
  movie: Movie & Record<string, string>;
  providers: any[];
}

function DetailsTab({ movie, providers }: DetailsTabProps) {
  const t = useTranslation();

  return (
    <ScrollView
      overScrollMode="never"
      bounces={false}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {!!movie?.overview && (
        <Text style={styles.overview}>{movie?.overview}</Text>
      )}

      <View style={styles.info}>
        {!!movie?.runtime && (
          <Text style={styles.text}>
            {t("movie.details.runtime")}: {movie?.runtime}{" "}
            {t("movie.details.minutes")}
          </Text>
        )}

        {!!movie?.status && (
          <Text style={styles.text}>
            {t("movie.details.status")}: {movie?.status}
          </Text>
        )}
      </View>

      {providers && <WatchProviders providers={providers as any} />}
    </ScrollView>
  );
}

export default memo(DetailsTab);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 15,
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
