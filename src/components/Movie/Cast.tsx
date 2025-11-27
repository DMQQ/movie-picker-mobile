import { FlatList, View, StyleSheet } from "react-native";
import { useGetMovieKeyPeopleQuery } from "../../redux/person/personApi";
import { Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";
import layout from "../../utils/layout";
import FrostedGlass from "../FrostedGlass";

export default function Cast({
  id,
  type,
}: {
  id: number;
  type: "movie" | "tv";
}) {
  const { data, isLoading } = useGetMovieKeyPeopleQuery({
    id,
    type,
    actorLimit: 20,
    includeDirector: true,
  });

  const t = useTranslation();

  if (data?.actors.length === 0 && data?.directors.length === 0 && !isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.actors}
        keyExtractor={(item, index) => item.id.toString() + index}
        showsHorizontalScrollIndicator={false}
        numColumns={2}
        renderItem={({ item }) => (
          <FrostedGlass style={styles.card} container={{ marginRight: 10 }}>
            <Thumbnail
              priority="low"
              size={200}
              path={item.profile_path || ""}
              container={styles.image}
            />
            <View style={{ paddingTop: 0 }}>
              <Text style={styles.character} numberOfLines={1}>
                {item.character === "Self" ? item.name : item.character}
              </Text>
              <Text style={styles.actor} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          </FrostedGlass>
        )}
      />
      <FlatList
        style={{ marginTop: 30 }}
        horizontal
        data={data?.directors}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <FrostedGlass
            style={styles.directorContainer}
            container={{ marginRight: 15 }}
          >
            {item?.profile_path && (
              <Thumbnail
                priority="low"
                path={item?.profile_path || ""}
                container={styles.directorImage}
              />
            )}

            <View
              style={{
                gap: 5,
                flex: 1,
              }}
            >
              <Text
                style={{ color: "#fff", fontSize: 22.5, fontFamily: "Bebas" }}
              >
                {item?.name}
              </Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: 16,
                  fontFamily: "Bebas",
                }}
              >
                {item?.job}
              </Text>
            </View>
          </FrostedGlass>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  card: {
    padding: 15,
    borderRadius: 25,
    maxWidth: Math.min(layout.screen.width * 0.45 - 2, 200),
  },
  image: {
    width: Math.min(layout.screen.width * 0.45 - 30, 170),
    height: Math.min(layout.screen.width * 0.45 - 30, 170) * 1.2,
    borderRadius: 10,
    marginBottom: 8,
  },
  character: {
    fontFamily: "Bebas",
    fontSize: 19,
    color: "#fff",
    flexWrap: "wrap",
  },
  actor: {
    fontSize: 14,
    color: "#ccc",
  },

  directorContainer: {
    padding: 15,
    flexDirection: "row",
    gap: 15,
    borderRadius: 100,
    paddingRight: 15,
    alignItems: "center",
  },

  directorImage: {
    width: 60,
    height: 80,
    borderRadius: 10,
  },
});
