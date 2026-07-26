import { Dimensions, StyleSheet, View } from "react-native";
import Skeleton from "../Skeleton/Skeleton";

const { width } = Dimensions.get("screen");
const CONTENT_WIDTH = width - 40;

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: "#000",
    borderTopEndRadius: 25,
    borderTopStartRadius: 25,
    padding: 20,
  },
  handle: {
    width: 60,
    height: 4,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    width: CONTENT_WIDTH * 0.7,
    height: 50,
    borderRadius: 5,
    marginBottom: 8,
  },
  title2: {
    width: CONTENT_WIDTH * 0.5,
    height: 50,
    borderRadius: 5,
    marginBottom: 15,
  },
  tagline: {
    width: CONTENT_WIDTH * 0.6,
    height: 18,
    borderRadius: 5,
    marginBottom: 10,
  },
  rating: {
    width: 120,
    height: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  metaLine: {
    width: CONTENT_WIDTH * 0.8,
    height: 16,
    borderRadius: 5,
    marginBottom: 10,
  },
  quickActions: {
    width: CONTENT_WIDTH,
    height: 70,
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 20,
  },
  overview: {
    width: CONTENT_WIDTH,
    height: 140,
    borderRadius: 10,
    marginBottom: 20,
  },
  castRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  castItem: {
    width: 80,
    height: 50,
    borderRadius: 10,
  },
  sectionTitle: {
    width: CONTENT_WIDTH * 0.4,
    height: 22,
    borderRadius: 5,
    marginBottom: 15,
  },
  attribution: {
    width: 120,
    height: 16,
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 10,
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
