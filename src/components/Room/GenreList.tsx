// src/screens/Room/RoomSetup/components/GenreList.tsx

import { ScrollView, StyleSheet, View } from "react-native";

import { getGenreIcon } from "../../utils/roomsConfig";
import SelectionCard from "./SelectionCard";

export type Genre = { id: number; name: string };

type GenreListProps = {
  genres: Genre[];
  selectedGenres: Genre[];
  onGenrePress: (genre: Genre) => void;
  isLoading: boolean;
  isCategorySelected: boolean;
};

const GenreList = ({
  genres,
  selectedGenres = [], // <<< FIX: Default to an empty array
  onGenrePress,
  isLoading,
  isCategorySelected,
}: GenreListProps) => {
  const isSelected = (genreId: number) => selectedGenres.some((g) => g.id === genreId);

  const renderContent = () => {
    const genreColumns = [];
    for (let i = 0; i < genres.length; i += 2) {
      genreColumns.push(genres.slice(i, i + 2));
    }

    return genreColumns.map((column, index) => (
      <View key={`column-${index}`}>
        {column.map((item) => (
          <SelectionCard
            key={item.id}
            label={item.name}
            iconData={getGenreIcon(item.id)}
            isSelected={isSelected(item.id)}
            onPress={() => onGenrePress(item)}
          />
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={isCategorySelected && !isLoading}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 140, // 2 rows of 60px height + 10px margin-bottom
  },
  skeleton: {
    width: 150,
    height: 60,
    backgroundColor: "#333",
    borderRadius: 8,
    marginRight: 15,
    marginBottom: 10,
  },
});

export default GenreList;
