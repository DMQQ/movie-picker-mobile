import { useMemo, useState } from "react";
import { useAppSelector } from "../../redux/store";
import { Movie } from "../../../types";
import TilesList from "../../components/Overview/TilesList";
import { View } from "react-native";
import MatchModal from "../../components/Movie/MatchModal";
import { Button, Portal } from "react-native-paper";
import Modal from "./Modal";
import useTranslation from "../../service/useTranslation";

export default function LikesScreen() {
  const { likes } = useAppSelector((state) => state.room.room);

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
    <View style={{ flex: 1, padding: 15 }}>
      <View style={{ marginBottom: 60 }}>
        <TilesList label={t("likes.title")} data={data} />
      </View>
      {match && <Modal onClose={() => setMatch(undefined)} match={match} />}

      <View style={{ position: "absolute", bottom: 10, left: 10, right: 10, paddingTop: 15, backgroundColor: "#000" }}>
        <Button
          onPress={randomMovie}
          mode="contained"
          style={{
            width: "100%",
            borderRadius: 100,
            ...(match ? { backgroundColor: "#f44336" } : {}),
          }}
          contentStyle={{ padding: 7.5 }}
        >
          {match ? t("likes.close") : t("likes.random")}
        </Button>
      </View>
    </View>
  );
}
