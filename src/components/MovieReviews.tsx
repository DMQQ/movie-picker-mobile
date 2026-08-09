import { Dimensions, FlatList, View } from "react-native";
import Text from "./Text";
import { useGetReviewsQuery } from "../redux/movie/movieApi";

import { colors, radius, spacing} from "../constants/design";

interface Review {
  id: string;
  author: string;

  content: string;

  author_details: {
    name: string;
    username: string;
    avatar_path: string;
    rating: number;
  };
}

export default function MovieReviews(props: { movieId: number; type: "movie" | "tv" }) {
  const { data } = useGetReviewsQuery({ id: props.movieId, type: props.type });

  return (
    <View>
      <FlatList
        style={{
          width: Dimensions.get("screen").width - 30,
        }}
        horizontal
        data={data}
        keyExtractor={(item: Review) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: spacing.sm + 2, width: Dimensions.get("screen").width - 30, backgroundColor: colors.appBackground, borderRadius: radius.md + 3 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: spacing.sm + 2,
              }}
            >
              <Text style={{ fontSize: 25, fontFamily: "Bebas", marginBottom: spacing.sm + 2 }}>{item.author}</Text>

              <Text style={{ color: "rgba(255,255,255,0.8)", marginBottom: spacing.sm + 2 }}>{item.author_details.rating}</Text>
            </View>
            <Text numberOfLines={10}>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}
