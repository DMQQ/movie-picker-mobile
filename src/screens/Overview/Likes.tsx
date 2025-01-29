import { useState } from "react";
import { useAppSelector } from "../../redux/store";
import { Movie } from "../../../types";
import TilesList from "../../components/Overview/TilesList";
import { View } from "react-native";
import MatchModal from "../../components/Movie/MatchModal";
import { Button, Portal } from "react-native-paper";
import Modal from "./Modal";

export default function LikesScreen() {
  const { likes } = useAppSelector((state) => state.room.room);

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  const randomMovie = () => {
    if (match) return setMatch(undefined);
    setMatch(likes[Math.floor(Math.random() * likes.length)]);
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <TilesList label="Your Likes" data={likes} />

      {match && <Modal match={match} />}

      <Button
        onPress={randomMovie}
        mode="contained"
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          right: 10,
          width: "100%",
          borderRadius: 100,
          ...(match ? { backgroundColor: "#f44336" } : {}),
        }}
        contentStyle={{ padding: 7.5 }}
      >
        {match ? "Close match" : "Random match"}
      </Button>
    </View>
  );
}
