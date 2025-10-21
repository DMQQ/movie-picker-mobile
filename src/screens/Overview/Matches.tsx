import { useMemo, useState } from "react";
import { View } from "react-native";
import { Movie } from "../../../types";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import TilesList from "../../components/Overview/TilesList";
import { useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import Modal from "./Modal";

export default function MatchesScreen() {
  const matches = useAppSelector((state) => state.room.room.matches);

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  const randomMovie = () => {
    if (match) return setMatch(undefined);
    setMatch(matches[Math.floor(Math.random() * matches.length)]);
  };

  const t = useTranslation();

  const data = useMemo(() => {
    return [...matches].reverse();
  }, [matches.length]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 15 }}>
        <TilesList label={t("matched.title")} data={data} />
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
