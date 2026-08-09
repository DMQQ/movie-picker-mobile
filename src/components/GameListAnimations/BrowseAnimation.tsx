import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { colors, radius, spacing} from "../../constants/design";

const BrowseAnimation = () => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Continuous scroll animation
    const scrollLoop = () => {
      scrollAnim.setValue(0);
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) scrollLoop();
      });
    };

    scrollLoop();

    return () => {
      scrollAnim.stopAnimation();
    };
  }, []);

  const translateX = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -200],
  });

  // Movie poster placeholders
  const movies = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    color: [
      "#6366f1", "#ef4444", "#10b981", "#f59e0b",
      "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
    ][i % 8],
  }));

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Featured section */}
      <View style={styles.featuredSection}>
        <View style={styles.featuredPoster}>
          <View style={styles.featuredImagePlaceholder} />
          <View style={styles.featuredInfo}>
            <View style={styles.featuredTitle} />
            <View style={styles.featuredSubtitle} />
          </View>
        </View>
      </View>

      {/* Category label */}
      <View style={styles.categoryLabel}>
        <View style={styles.categoryText} />
        <View style={styles.categoryDot} />
        <View style={styles.categoryDot} />
        <View style={styles.categoryDot} />
      </View>

      {/* Scrolling movie row */}
      <View style={styles.scrollContainer}>
        <Animated.View style={[styles.moviesRow, { transform: [{ translateX }] }]}>
          {movies.map((movie) => (
            <View key={movie.id} style={[styles.movieCard, { backgroundColor: movie.color }]}>
              <View style={styles.moviePoster} />
              <View style={styles.movieInfo}>
                <View style={styles.movieTitle} />
                <View style={styles.movieRating} />
              </View>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Second row */}
      <View style={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.moviesRow,
            { transform: [{ translateX: Animated.multiply(translateX, -0.7) }] }
          ]}
        >
          {movies.slice().reverse().map((movie, index) => (
            <View key={`row2-${movie.id}`} style={[styles.movieCard, { backgroundColor: movie.color, opacity: 0.7 }]}>
              <View style={styles.moviePoster} />
              <View style={styles.movieInfo}>
                <View style={styles.movieTitle} />
                <View style={styles.movieRating} />
              </View>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Bottom nav hint */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem} />
        <View style={[styles.navItem, styles.navItemActive]} />
        <View style={styles.navItem} />
        <View style={styles.navItem} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.input,
    padding: spacing.screen,
    justifyContent: "center",
  },
  featuredSection: {
    marginBottom: spacing.screen,
  },
  featuredPoster: {
    height: 80,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    overflow: "hidden",
    flexDirection: "row",
  },
  featuredImagePlaceholder: {
    width: 60,
    height: "100%",
    backgroundColor: "#6366f1",
  },
  featuredInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "center",
  },
  featuredTitle: {
    height: 14,
    width: "70%",
    backgroundColor: "#444",
    borderRadius: radius.xs,
    marginBottom: spacing.sm,
  },
  featuredSubtitle: {
    height: 10,
    width: "50%",
    backgroundColor: "#333",
    borderRadius: radius.xs,
  },
  categoryLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm + 2,
    gap: spacing.sm - 2,
  },
  categoryText: {
    height: 12,
    width: 80,
    backgroundColor: "#444",
    borderRadius: radius.xs,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: radius.xs - 1,
    backgroundColor: "#333",
  },
  scrollContainer: {
    height: 90,
    overflow: "hidden",
    marginBottom: spacing.sm + 2,
  },
  moviesRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  movieCard: {
    width: 60,
    height: 85,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  moviePoster: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  movieInfo: {
    padding: spacing.xs + 2,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  movieTitle: {
    height: 6,
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: radius.xs - 2,
    marginBottom: spacing.xs,
  },
  movieRating: {
    height: 4,
    width: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.xs - 2,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginTop: spacing.sm + 2,
  },
  navItem: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: "#333",
  },
  navItemActive: {
    backgroundColor: "#6366f1",
  },
});

export default BrowseAnimation;
