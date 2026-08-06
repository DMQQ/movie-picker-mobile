import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import PlatformBlurView from "../PlatformBlurView";
import { radius, spacing } from "../../constants/design";

interface PageIndicatorProps {
  categories: any[];
  currentPage: number;
}

const pageIndicatorStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  blurContainer: {
    borderRadius: radius.modal,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    overflow: "hidden",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.xs,
  },
});

const PageIndicator = memo(({ categories, currentPage }: PageIndicatorProps) => {
  if (categories.length <= 1) {
    return null;
  }

  return (
    <View style={pageIndicatorStyles.container}>
      <PlatformBlurView intensity={20} style={pageIndicatorStyles.blurContainer}>
        <View style={pageIndicatorStyles.dotsContainer}>
          {categories.map((category, index) => (
            <Animated.View
              key={category.id}
              style={[
                pageIndicatorStyles.dot,
                {
                  backgroundColor: currentPage === index ? "#fff" : "rgba(255, 255, 255, 0.3)",
                  transform: [{ scale: currentPage === index ? 1.2 : 1 }],
                },
              ]}
            />
          ))}
        </View>
      </PlatformBlurView>
    </View>
  );
});

export default PageIndicator;