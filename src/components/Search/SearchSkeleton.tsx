import { Dimensions, StyleSheet, View } from "react-native";
import SkeletonCard from "../Room/SkeletonCard";
import { colors, radius, spacing } from "../../constants/design";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const INNER_WIDTH = CARD_WIDTH - spacing.lg * 2;

export default function SearchSkeleton() {
  return (
    <View>
      {[0, 1].map((cardIndex) => (
        <View key={cardIndex} style={styles.card}>
          <SkeletonCard
            width={170}
            height={230}
            borderRadius={radius.sm + 2}
            style={styles.poster}
          />
          <SkeletonCard
            width={INNER_WIDTH}
            height={32}
            borderRadius={radius.xs + 1}
            style={styles.block}
          />
          <SkeletonCard
            width={140}
            height={18}
            borderRadius={radius.xs + 1}
            style={styles.block}
          />
          {[0, 1, 2].map((lineIndex) => (
            <SkeletonCard
              key={lineIndex}
              width={INNER_WIDTH}
              height={14}
              borderRadius={radius.xs + 1}
              style={styles.block}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginTop: spacing.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  poster: {
    marginRight: 0,
    marginBottom: spacing.lg,
  },
  block: {
    marginRight: 0,
    marginBottom: spacing.sm + 2,
  },
});
