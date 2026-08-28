import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Movie } from "../../../types";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import TilesList from "../../components/Overview/TilesList";
import { useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import Modal from "./Modal";
import { colors, spacing } from "../../constants/design";
import { useNotificationNudge } from "../../hooks/useNotificationNudge";

export default function MatchesScreen() {
  const matches = useAppSelector((state) => state.room.matches);

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  const randomMovie = () => {
    if (match) return setMatch(undefined);
    setMatch(matches[Math.floor(Math.random() * matches.length)]);
  };

  const t = useTranslation();

  const data = useMemo(() => {
    return [...matches].reverse();
  }, [matches.length]);

  useNotificationNudge("post_game");

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <TilesList label={t("matched.title")} data={data} layout="column" />
        <LinearGradient
          colors={["rgba(10,10,15,0)", colors.appBackground]}
          style={styles.gradient}
          pointerEvents="none"
        />
      </View>

      {match && <Modal onClose={() => setMatch(undefined)} match={match} />}

      <MoviesActionButtons
        onScratchCardPress={randomMovie}
        match={!!match}
        fortuneWheelMovies={data}
        fortuneWheelTitle={t("matched.title")}
        containerStyle={{ bottom: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1, padding: spacing.screen, paddingBottom: 0 },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
});
