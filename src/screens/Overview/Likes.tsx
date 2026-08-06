import { useMemo, useState } from "react";
import { View } from "react-native";
import { Movie } from "../../../types";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import TilesList from "../../components/Overview/TilesList";
import { useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import Modal from "./Modal";
import { spacing } from "../../constants/design";

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
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: spacing.screen }}>
        <TilesList label={t("likes.title")} data={data} />
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
