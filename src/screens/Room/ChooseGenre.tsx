import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { Appbar, Button, IconButton, Text, TouchableRipple, useTheme } from "react-native-paper";
import { useCreateRoom } from "./ContextProvider";
import useFetch from "../../service/useFetch";
import Skeleton from "../../components/Skeleton/Skeleton";
import Animated, { FadeIn } from "react-native-reanimated";
import { useGetGenresQuery } from "../../redux/movie/movieApi";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import useTranslation from "../../service/useTranslation";
import PageHeading from "../../components/PageHeading";

const ListEmptyComponent = () => {
  const { width } = useWindowDimensions();
  return (
    <Skeleton>
      <View style={{ width: width - 30, height: 60 * 10 }}>
        {Array.from(new Array(10).keys()).map((i) => (
          <View key={i} style={[styles.placeholder, { width: width - 30 }]} />
        ))}
      </View>
    </Skeleton>
  );
};

export default function ChooseGenre({ navigation }: any) {
  const { category, genre, setGenre: selectGenre } = useCreateRoom();
  const { data: genres = [], isLoading: loading } = useGetGenresQuery({
    type: category.includes("tv") ? "tv" : "movie",
  });

  const t = useTranslation();

  return (
    <SafeIOSContainer>
      <PageHeading title={t("room.genre")} />
      <View style={{ flex: 1, paddingHorizontal: 15 }}>
        <View style={{ flex: 1 }}>
          {loading ? (
            <ListEmptyComponent />
          ) : (
            <FlatList
              initialNumToRender={12}
              style={{ flex: 1, paddingBottom: 25 }}
              data={genres as { id: number; name: string }[]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <GenreTile index={index} item={item} isIncluded={genre.some((g) => g.id === item.id)} selectGenre={selectGenre} />
              )}
            />
          )}
        </View>

        <Button
          mode="contained"
          style={{
            borderRadius: 100,
            marginTop: 10,
          }}
          contentStyle={{ padding: 7.5 }}
          onPress={() => navigation.navigate("ExtraSettings")}
        >
          {t("room.next")}
        </Button>
      </View>
    </SafeIOSContainer>
  );
}

const GenreTile = ({
  item,
  isIncluded,
  selectGenre,
  index,
}: {
  item: { id: number; name: string };
  isIncluded: boolean;
  selectGenre: (val: any) => void;
  index: number;
}) => {
  const theme = useTheme();

  const onTilePress = () => {
    if (isIncluded) {
      selectGenre((val: (typeof item)[]) => val.filter((g: any) => g.id !== item.id));
    } else {
      selectGenre((val: (typeof item)[]) => [...val, item]);
    }
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 50)} style={[styles.tile, { backgroundColor: theme.colors.surface }]}>
      <>
        <Text style={styles.tileText}>{item.name}</Text>

        <TouchableRipple style={{ padding: 5 }} onPress={onTilePress}>
          <Text style={[styles.tileButtonText, { color: isIncluded ? theme.colors.error : theme.colors.primary }]}>
            {isIncluded ? "Remove" : "Select"}
          </Text>
        </TouchableRipple>
      </>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileText: {
    fontSize: 17,
    fontWeight: "600",
    paddingHorizontal: 5,
  },
  tileButtonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 5,
  },
  placeholder: {
    height: 50,
    backgroundColor: "#000",
    marginBottom: 10,
    borderRadius: 10,
  },
});
