import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SelectionCard from "../SelectionCard";
import SkeletonCard from "../SkeletonCard";
import { useGetSpecialCategoriesWithThumbnailsQuery } from "../../../redux/movie/movieApi";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { toggleSpecialCategory } from "../../../redux/roomBuilder/roomBuilderSlice";
import { fontSize, spacing } from "../../../constants/design";

const Step4SpecialCategories: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const selectedCategories = useAppSelector((state) => state.builder.specialCategories);
  const gameType = useAppSelector((state) => state.builder.gameType);
  const { data: categoriesWithThumbnails, isLoading } = useGetSpecialCategoriesWithThumbnailsQuery({ type: gameType });

  const onToggleCategory = (categoryId: string) => {
    dispatch(toggleSpecialCategory(categoryId));
  };

  const specialCategoryOptions = useMemo(() => {
    if (!categoriesWithThumbnails || categoriesWithThumbnails.length === 0) {
      return [];
    }

    return categoriesWithThumbnails.map((category) => ({
      id: category.id,
      label: category.label,
      iconData: {
        component: MaterialIcons,
        name: category.icon,
        color: category.iconColor,
      },
      posterUrl: category.representative_poster,
    }));
  }, [categoriesWithThumbnails]);

  const cardWidth = Dimensions.get("window").width * 0.75;
  const cardHeight = Dimensions.get("window").height * 0.65;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          ))
        )}
      </ScrollView>
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
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    opacity: 0.7,
  },
});

export default Step4SpecialCategories;
