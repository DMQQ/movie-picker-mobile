// src/screens/Room/RoomSetup/components/CategoryList.tsx

import { ScrollView, StyleSheet, View } from "react-native";

import { getCategoryIcon } from "../../utils/roomsConfig";
import SelectionCard from "./SelectionCard";

type Category = { label: string; path: string };

type CategoryListProps = {
  categories: Category[];
  selectedCategory: string;
  onCategoryPress: (category: Category) => void;
};

const CategoryList = ({ categories, selectedCategory, onCategoryPress }: CategoryListProps) => {
  // Group categories into columns of 2 for the two-row layout
  const categoryColumns = [];
  for (let i = 0; i < categories.length; i += 2) {
    categoryColumns.push(categories.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categoryColumns.map((column, index) => (
          <View key={`column-${index}`}>
            {column.map((item) => (
              <SelectionCard
                key={item.path}
                label={item.label}
                iconData={getCategoryIcon(item.path)}
                isSelected={selectedCategory === item.path}
                onPress={() => onCategoryPress(item)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 140, // 2 rows of 60px height + 10px margin-bottom
  },
});

export default CategoryList;
