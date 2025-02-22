import { FlatList, Image, View, StyleSheet } from "react-native";
import { useGetMovieKeyPeopleQuery } from "../../redux/person/personApi";
import { MD2DarkTheme, Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";

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
            <Image source={{ uri: "https://image.tmdb.org/t/p/w200" + item.profile_path }} style={styles.image} />
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
            <Image
              source={{
                uri: "https://image.tmdb.org/t/p/w200" + item?.profile_path,
              }}
              style={styles.directorImage}
            />

            <View
              style={{
                gap: 5,
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
    borderRadius: 12,
    marginRight: 12,
    width: 120,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 160,
    borderRadius: 10,
    marginBottom: 8,
  },
  character: {
    fontFamily: "Bebas",
    fontSize: 19,
    color: "#fff",
    textAlign: "center",
  },
  actor: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
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
