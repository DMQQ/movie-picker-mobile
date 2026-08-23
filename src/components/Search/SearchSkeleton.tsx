import { Dimensions, StyleSheet, View } from "react-native";
import SkeletonCard from "../Room/SkeletonCard";
import { colors, radius, spacing } from "../../constants/design";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

export default function SearchSkeleton() {
  return (
    <View>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.card}>
          <SkeletonCard width={60} height={90} borderRadius={0} />
          <View style={styles.info}>
            <SkeletonCard width={160} height={22} borderRadius={radius.xs} />
            <SkeletonCard width={100} height={14} borderRadius={radius.xs} style={styles.row2} />
            <SkeletonCard width={120} height={14} borderRadius={radius.xs} style={styles.row3} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    width: CARD_WIDTH,
    height: 90,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  info: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  row2: {
    marginTop: spacing.xs,
  },
  row3: {
    marginTop: spacing.xs,
  },
});
