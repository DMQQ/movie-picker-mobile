import type { ReactNode } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Movie } from "../../../types";
import Thumbnail from "../Thumbnail";
import { Link } from "expo-router";
import Touch from "../Touch";

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
      <Link
        href={{
          pathname: "/movie/type/[type]/[id]",
          params: { id: match.id, type, img: match.poster_path },
        }}
        asChild
        disabled={disabled}
      >
        <Touch onLongPress={() => onLongPress && onLongPress(match)}>
          <Link.Trigger>
            <View style={{ position: "relative" }}>
              {badge}
              <Link.AppleZoom>
                <Thumbnail
                  size={posterSize}
                  path={match.poster_path}
                  style={{ width: "100%", aspectRatio: 2 / 3, borderRadius: 10 }}
                />
              </Link.AppleZoom>
            </View>
          </Link.Trigger>
          <Link.Preview />
        </Touch>
      </Link>
      {renderFooter?.(match)}
    </View>
  );
};

export default MatchTile;
