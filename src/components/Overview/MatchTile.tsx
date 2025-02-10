import { TouchableRipple } from "react-native-paper";
import { Movie } from "../../../types";
import Animated from "react-native-reanimated";

const MatchTile = ({ match, type: _type, navigation }: { match: Movie; type: string; navigation: any; index: number }) => {
  const type = (match?.type || _type).includes("movie") ? "movie" : "tv";

  return (
    <TouchableRipple
      style={{
        margin: 5,
        flex: 1,
        maxWidth: "33.3%",
      }}
      onPress={() =>
        navigation.navigate("MovieDetails", {
          id: match.id,
          type: match?.type || type,
          img: match.poster_path,
        })
      }
    >
      <Animated.Image
        resizeMode="cover"
        resizeMethod="resize"
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + match.poster_path,
        }}
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
