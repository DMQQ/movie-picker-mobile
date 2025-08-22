import { TouchableRipple } from "react-native-paper";
import { Movie } from "../../../types";
import Thumbnail from "../Thumbnail";

interface MatchTileProps {
  match: Movie;
  type: string;
  navigation: any;
  index: number;
  posterSize?: number;

  onLongPress?: (item: Movie) => void;
}

const MatchTile = ({ match, type: _type, navigation, posterSize = 200, onLongPress }: MatchTileProps) => {
  const type = (match?.type || _type).includes("movie") ? "movie" : "tv";

  return (
    <TouchableRipple
      style={{
        margin: 5,
        flex: 1,
      }}
      onPress={() =>
        navigation.navigate("MovieDetails", {
          id: match.id,
          type: match?.type || type,
          img: match.poster_path,
        })
      }
      onLongPress={() => onLongPress && onLongPress(match)}
    >
      <Thumbnail
        size={posterSize}
        path={match.poster_path}
        style={{
          width: "100%",
          aspectRatio: 2 / 3,
          borderRadius: 10,
        }}
      />
    </TouchableRipple>
  );
};

export default MatchTile;
