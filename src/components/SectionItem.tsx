import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import Animated, { FadeIn } from "react-native-reanimated";
import { Movie } from "../../types";
import Thumbnail from "./Thumbnail";

const getColor = (score: number) => {
  if (score >= 7) return "#21d07a"; // Green
  if (score >= 4) return "#d2d531"; // Yellow
  return "#db2360"; // Red
};

export const SectionListItem = (item: Movie & { onPress: () => void }) => (
  <Pressable onPress={item.onPress} style={sectionStyles.item}>
    <Thumbnail path={item.poster_path} size={185} container={sectionStyles.image} />
    {item.vote_average > 0 && (
      <View style={[sectionStyles.badgeContainer, { backgroundColor: getColor(item.vote_average || 0) }]}>
        <Text
          style={[
            sectionStyles.badgeItem,
            {
              color: item.vote_average < 4 ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.9)",
            },
          ]}
        >
          {item.vote_average ? item.vote_average.toFixed(1) + "/10" : "N/A"}
        </Text>
      </View>
    )}
  </Pressable>
);

const { width } = Dimensions.get("screen");

const sectionStyles = StyleSheet.create({
  item: {
    position: "relative",
    overflow: "hidden",
    marginRight: 15,
  },

  image: {
    width: Math.min(width * 0.25, 200),
    height: Math.min(width * 0.25, 200) * 1.5,
    borderRadius: 5,
  },

  badgeContainer: {
    position: "absolute",
    right: -2,
    bottom: 0,
    backgroundColor: MD2DarkTheme.colors.surface,
    paddingHorizontal: 5,
    paddingVertical: 3,
    transform: [{ skewX: "-10deg" }],
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 6,
  },

  badgeItem: {
    fontSize: 10,
    transform: [{ skewX: "10deg" }],
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
});

export default SectionListItem;
