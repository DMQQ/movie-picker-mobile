import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import SwipeableGenreCard from "../Room/BuilderSteps/SwipeableGenreCard";
import SkeletonCard from "../Room/SkeletonCard";
import { useGetGenresWithThumbnailsQuery } from "../../redux/movie/movieApi";
import { spacing } from "../../constants/design";

const cardWidth = Dimensions.get("window").width * 0.75;
const cardHeight = Dimensions.get("window").height * 0.65;

interface Props {
  type: "movie" | "tv";
  genres: number[];
  onToggleGenre: (id: number) => void;
}

export default function GenreSwipeStep({ type, genres, onToggleGenre }: Props) {
  const { data: allGenres, isLoading } = useGetGenresWithThumbnailsQuery({ type });

  const isSelected = (id: number) => genres.includes(id) || genres.length === 0;

  return (
    <View style={styles.container}>
      <FlatList
        initialNumToRender={2}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={cardWidth + 16}
        data={allGenres}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: genre, index }) => (
          <SwipeableGenreCard
            key={genre.id}
            genreName={genre.name}
            posterUrl={genre.representative_poster}
            isSelected={isSelected(genre.id)}
            onPress={() => onToggleGenre(genre.id)}
            delay={index * 50}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <>
              {[1, 2, 3].map((item) => (
                <SkeletonCard key={item} width={cardWidth} height={cardHeight} borderRadius={16} />
              ))}
            </>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Dimensions.get("window").height * 0.75,
  },
  scrollContent: {
    alignItems: "center",
  },
});
