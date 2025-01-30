import { TouchableRipple } from "react-native-paper";
import { Movie } from "../../../types";
import { Image } from "react-native";
import Animated from "react-native-reanimated";
import { sharedElementTransition } from "../../service/utils/SharedElementTransition";

const MatchTile = ({ match, type, navigation }: { match: Movie; type: string; navigation: any; index: number }) => {
  return (
    <TouchableRipple
      style={{
        margin: 5,
        flexDirection: "row",
        flex: 1,
        maxWidth: "50%",
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
        // sharedTransitionStyle={sharedElementTransition}
        // sharedTransitionTag={`movie-poster-image-${match.poster_path}`}
        resizeMode="cover"
        resizeMethod={"resize"}
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + match.poster_path,
        }}
        style={{ width: "100%", height: 250, borderRadius: 10 }}
      />
    </TouchableRipple>
  );
};

export default MatchTile;
