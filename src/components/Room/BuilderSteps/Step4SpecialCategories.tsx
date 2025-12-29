import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SelectionCard from "../SelectionCard";
import SkeletonCard from "../SkeletonCard";
import { useGetSpecialCategoriesWithThumbnailsQuery } from "../../../redux/movie/movieApi";

interface Step4SpecialCategoriesProps {
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  gameType: "movie" | "tv";
}

const Step4SpecialCategories: React.FC<Step4SpecialCategoriesProps> = React.memo(({ selectedCategories, onToggleCategory, gameType }) => {
  const { data: categoriesWithThumbnails, isLoading } = useGetSpecialCategoriesWithThumbnailsQuery({ type: gameType });

  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const specialCategoryOptions = useMemo(() => {
    const baseOptions = [
      {
        id: "oscar",
        label: "Oscar Winners",
        iconData: { component: MaterialIcons, name: "emoji-events", color: "#FFD700" },
      },
      {
        id: "pg13",
        label: "PG-13",
        iconData: { component: MaterialIcons, name: "child-care", color: "#4CAF50" },
      },
      {
        id: "r_rated",
        label: "18+ Only",
        iconData: { component: MaterialIcons, name: "warning", color: "#FF5722" },
      },
      {
        id: "short_runtime",
        label: "<90m",
        iconData: { component: MaterialIcons, name: "schedule", color: "#4CAF50" },
      },
      {
        id: "long_runtime",
        label: ">90m",
        iconData: { component: MaterialIcons, name: "hourglass-full", color: "#FF9800" },
      },
      {
        id: "90s",
        label: "90s",
        iconData: { component: MaterialIcons, name: "album", color: "#9C27B0" },
      },
      {
        id: "2000s",
        label: "2000s",
        iconData: { component: MaterialIcons, name: "phone-android", color: "#2196F3" },
      },
      {
        id: "2010s",
        label: "2010s",
        iconData: { component: MaterialIcons, name: "tablet", color: "#FF9800" },
      },
      {
        id: "2020s",
        label: "2020s",
        iconData: { component: MaterialIcons, name: "wifi", color: "#00BCD4" },
      },
    ];

    // Merge with fetched thumbnails
    if (!categoriesWithThumbnails) {
      return baseOptions.map((option) => ({
        ...option,
        posterUrl: "",
      }));
    }

    return baseOptions.map((option) => {
      const thumbnailData = categoriesWithThumbnails.find((cat) => cat.id === option.id);
      return {
        ...option,
        posterUrl: thumbnailData?.representative_poster || "",
      };
    });
  }, [categoriesWithThumbnails]);

  const cardWidth = Dimensions.get("window").width * 0.75;
  const cardHeight = Dimensions.get("window").height * 0.65;

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToInterval={cardWidth + 16}
        decelerationRate="fast"
      >
        {isLoading ? (
          <>
            {[1, 2, 3].map((item) => (
              <SkeletonCard key={item} width={cardWidth} height={cardHeight} borderRadius={16} />
            ))}
          </>
        ) : (
          specialCategoryOptions.map((option, index) => (
            <SelectionCard
              key={option.id}
              label={option.label}
              iconData={option.iconData}
              isSelected={selectedCategories.includes(option.id)}
              onPress={() => onToggleCategory(option.id)}
              vertical
              delay={index * 50}
              posterUrl={option.posterUrl}
              scrollX={scrollX}
              index={index}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          ))
        )}
      </Animated.ScrollView>
    </View>
  );
});

Step4SpecialCategories.displayName = "Step4SpecialCategories";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get("window").height * 0.75,
  },
  scrollContent: {
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
});

export default Step4SpecialCategories;
