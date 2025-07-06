import { Dimensions, FlatList, View } from "react-native";
import { useGetReviewsQuery } from "../redux/movie/movieApi";
import { Text } from "react-native-paper";
import { getConstrainedDimensions } from "../utils/getConstrainedDimensions";

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
          width: getConstrainedDimensions("screen").width - 30,
        }}
        horizontal
        data={data}
        keyExtractor={(item: Review) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, width: getConstrainedDimensions("screen").width - 30, backgroundColor: "#000", borderRadius: 15 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 25, fontFamily: "Bebas", marginBottom: 10 }}>{item.author}</Text>

              <Text style={{ color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>{item.author_details.rating}</Text>
            </View>
            <Text numberOfLines={10}>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}
