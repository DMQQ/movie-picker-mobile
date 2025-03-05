import { FlatList, View, StyleSheet } from "react-native";
import { useGetMovieKeyPeopleQuery } from "../../redux/person/personApi";
import { Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";
import layout from "../../utils/layout";

export default function Cast({ id, type }: { id: number; type: "movie" | "tv" }) {
  const { data, error } = useGetMovieKeyPeopleQuery({ id, type, actorLimit: 15, includeDirector: true });

  const t = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={{ color: "#fff", fontSize: 45, fontFamily: "Bebas", lineHeight: 45, marginBottom: 10 }}>{t("cast.heading")}</Text>

      <FlatList
        horizontal
        data={data?.actors}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Thumbnail size={200} path={item.profile_path || ""} container={styles.image} />
            <Text style={styles.character} numberOfLines={1}>
              {item.character === "Self" ? item.name : item.character}
            </Text>
            <Text style={styles.actor} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        )}
      />
      <FlatList
        horizontal
        data={data?.directors}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.directorContainer}>
            {item?.profile_path && <Thumbnail path={item?.profile_path || ""} container={styles.directorImage} />}

            <View
              style={{
                gap: 10,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 22.5, fontFamily: "Bebas" }}>{item?.name}</Text>

              <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: 16, fontFamily: "Bebas" }}>{item?.job}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  card: {
    borderRadius: 15,
    marginRight: 20,
    maxWidth: layout.screen.width * 0.3,
  },
  image: {
    width: layout.screen.width * 0.3,
    height: layout.screen.height * 0.2,
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
    flexDirection: "row",
    gap: 15,
    borderRadius: 100,
    paddingRight: 15,
    alignItems: "center",
    marginTop: 30,
  },

  directorImage: {
    width: 60,
    height: 80,
    borderRadius: 10,
  },
});
