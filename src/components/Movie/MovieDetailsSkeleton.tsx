import { Dimensions, StyleSheet, View } from "react-native";
import Skeleton from "../Skeleton/Skeleton";
import { radius, spacing } from "../../constants/design";

const { width } = Dimensions.get("screen");
const CONTENT_WIDTH = width - 40;

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: "#000",
    borderTopEndRadius: 25,
    borderTopStartRadius: 25,
    padding: spacing.xl,
  },
  handle: {
    width: 60,
    height: 4,
    borderRadius: radius.sm + 2,
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  title: {
    width: CONTENT_WIDTH * 0.7,
    height: 50,
    borderRadius: radius.xs + 1,
    marginBottom: spacing.sm,
  },
  title2: {
    width: CONTENT_WIDTH * 0.5,
    height: 50,
    borderRadius: radius.xs + 1,
    marginBottom: spacing.screen,
  },
  tagline: {
    width: CONTENT_WIDTH * 0.6,
    height: 18,
    borderRadius: radius.xs + 1,
    marginBottom: spacing.sm + 2,
  },
  rating: {
    width: 120,
    height: 20,
    borderRadius: radius.xs + 1,
    marginBottom: spacing.sm + 2,
  },
  metaLine: {
    width: CONTENT_WIDTH * 0.8,
    height: 16,
    borderRadius: radius.xs + 1,
    marginBottom: spacing.sm + 2,
  },
  quickActions: {
    width: CONTENT_WIDTH,
    height: 70,
    borderRadius: radius.modal,
    marginTop: spacing.xs + 1,
    marginBottom: spacing.xl,
  },
  overview: {
    width: CONTENT_WIDTH,
    height: 140,
    borderRadius: radius.sm + 2,
    marginBottom: spacing.xl,
  },
  castRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginBottom: spacing.xl,
  },
  castItem: {
    width: 80,
    height: 50,
    borderRadius: radius.sm + 2,
  },
  sectionTitle: {
    width: CONTENT_WIDTH * 0.4,
    height: 22,
    borderRadius: radius.xs + 1,
    marginBottom: spacing.screen,
  },
  attribution: {
    width: 120,
    height: 16,
    borderRadius: radius.xs + 1,
    alignSelf: "center",
    marginBottom: spacing.sm + 2,
  },
});

export default function MovieDetailsSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton>
        <View style={styles.handle} />
      </Skeleton>

      <Skeleton>
        <View style={styles.title} />
      </Skeleton>
      <Skeleton>
        <View style={styles.title2} />
      </Skeleton>

      <Skeleton>
        <View style={styles.tagline} />
      </Skeleton>

      <Skeleton>
        <View style={styles.rating} />
      </Skeleton>

      <Skeleton>
        <View style={styles.metaLine} />
      </Skeleton>

      <Skeleton>
        <View style={styles.quickActions} />
      </Skeleton>

      <Skeleton>
        <View style={styles.sectionTitle} />
      </Skeleton>
      <Skeleton>
        <View style={styles.overview} />
      </Skeleton>

      <View style={styles.castRow}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item}>
            <View style={styles.castItem} />
          </Skeleton>
        ))}
      </View>

      <Skeleton>
        <View style={styles.sectionTitle} />
      </Skeleton>
      <Skeleton>
        <View style={styles.overview} />
      </Skeleton>

      <Skeleton>
        <View style={styles.attribution} />
      </Skeleton>
    </View>
  );
}
