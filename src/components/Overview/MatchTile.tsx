import type { ReactNode } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { TouchableRipple } from "react-native-paper";
import { Movie } from "../../../types";
import Thumbnail from "../Thumbnail";
import { router } from "expo-router";

interface MatchTileProps {
  match: Movie;
  type: string;
  index: number;
  posterSize?: number;
  onLongPress?: (item: Movie) => void;
  renderFooter?: (movie: Movie) => ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const MatchTile = ({
  match,
  type: _type,
  posterSize = 200,
  onLongPress,
  renderFooter,
  badge,
  disabled,
  containerStyle,
}: MatchTileProps) => {
  const type = (match?.type || _type).includes("movie") ? "movie" : "tv";

  return (
    <View style={[{ flex: 1 }, containerStyle]}>
      <TouchableRipple
        disabled={disabled}
        onPress={() =>
          router.push({
            pathname: "/movie/type/[type]/[id]",
            params: {
              id: match.id,
              type,
              img: match.poster_path,
            },
          })
        }
        onLongPress={() => onLongPress && onLongPress(match)}
      >
        <View style={{ position: "relative" }}>
          {badge}
          <Thumbnail
            size={posterSize}
            path={match.poster_path}
            style={{
              width: "100%",
              aspectRatio: 2 / 3,
              borderRadius: 10,
            }}
          />
        </View>
      </TouchableRipple>
      {renderFooter?.(match)}
    </View>
  );
};

export default MatchTile;
