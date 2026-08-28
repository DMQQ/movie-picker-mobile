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

export default function LikesScreen() {
  const likes = useAppSelector((state) => state.room.likes);

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  const randomMovie = () => {
    if (match) return setMatch(undefined);
    setMatch(likes[Math.floor(Math.random() * likes.length)]);
  };

  const t = useTranslation();

  const data = useMemo(() => {
    return [...likes].reverse();
  }, [likes.length]);

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <TilesList label={t("likes.title")} data={data} layout="column" />
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
