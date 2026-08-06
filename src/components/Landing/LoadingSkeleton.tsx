import { memo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Skeleton from "../Skeleton/Skeleton";
import { radius, spacing } from "../../constants/design";

const { width } = Dimensions.get("screen");

const skeletonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  sectionContainer: {
    marginBottom: spacing.xxl + 16,
  },
  moviesList: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginTop: spacing.screen,
  },
  movieCard: {
    alignItems: "center",
  },
});

const LoadingSkeleton = memo(() => {
  const movieWidth = Math.min(width * 0.25, 120);
  const movieHeight = movieWidth * 1.5;

  return (
    <View style={skeletonStyles.container}>
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <View key={sectionIndex} style={skeletonStyles.sectionContainer}>
          <Skeleton>
            <View style={{ width: 150, height: 25, backgroundColor: "#333", borderRadius: radius.xs + 1 }} />
          </Skeleton>
          <View style={skeletonStyles.moviesList}>
            {Array.from({ length: 4 }).map((_, movieIndex) => (
              <View key={movieIndex} style={skeletonStyles.movieCard}>
                <Skeleton>
                  <View style={{ width: movieWidth, height: movieHeight, backgroundColor: "#333", borderRadius: radius.sm }} />
                </Skeleton>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
});

export default LoadingSkeleton;