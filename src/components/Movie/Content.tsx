import { View } from "react-native";
import { Text } from "react-native-paper";
import { Movie } from "../../../types";

export default function Content(card: Movie) {
  return (
    <View style={{ padding: 10 }}>
      <Text style={{ fontSize: 25, fontWeight: "bold" }}>
        {card.title ? card.title : card.name}
      </Text>
      <View
        style={{
          flexDirection: "row",
          marginTop: 5,
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          {card.release_date}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
          {card.vote_average}
        </Text>
      </View>

      <Text
        numberOfLines={8}
        style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}
      >
        {card.overview}
      </Text>
    </View>
  );
}
