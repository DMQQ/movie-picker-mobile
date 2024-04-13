import { StyleSheet, View } from "react-native";
import { MD3Theme, Text } from "react-native-paper";
import { Movie } from "../../../types";

const reviewRange = (rating: number) => {
  if (rating >= 7.5) {
    return "#4CAF50";
  } else if (rating >= 5) {
    return "#FFC107";
  } else if (rating >= 3.5) {
    return "#FF9800";
  } else {
    return "#F44336";
  }
};

export default function Content(card: Movie & { theme: MD3Theme }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{card.title ? card.title : card.name}</Text>

      <View style={styles.row}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          {card.release_date}
        </Text>
        <Text
          style={[
            styles.votes,
            { backgroundColor: reviewRange(card.vote_average) },
          ]}
        >
          {(card.vote_average * 10).toFixed(1)}%
        </Text>
      </View>

      <Text numberOfLines={8} style={styles.overview}>
        {card.overview}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: { fontSize: 25, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    marginTop: 5,
    justifyContent: "space-between",
  },
  votes: {
    fontSize: 15,
    alignItems: "center",
    fontWeight: "bold",
    marginLeft: 10,
    paddingHorizontal: 10,
    borderRadius: 100,
    color: "#000",
    lineHeight: 25,
  },
  overview: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
});
