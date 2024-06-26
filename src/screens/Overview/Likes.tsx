import { useState } from "react";
import { useAppSelector } from "../../redux/store";
import { Movie } from "../../../types";
import TilesList from "../../components/Overview/TilesList";
import { View } from "react-native";
import MatchModal from "../../components/Movie/MatchModal";
import { Button } from "react-native-paper";

export default function LikesScreen() {
  const { likes } = useAppSelector((state) => state.room.room);

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  const randomMovie = () => {
    setMatch(likes[Math.floor(Math.random() * likes.length)]);
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <TilesList label="Your Likes" data={likes} />

      {match && (
        <MatchModal match={match} hideMatchModal={() => setMatch(undefined)} />
      )}

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
        }}
        contentStyle={{ padding: 7.5 }}
      >
        Randomize
      </Button>
    </View>
  );
}
