import { View, StyleSheet, ScrollView } from "react-native";
import { useGetMovieKeyPeopleQuery } from "../../redux/person/personApi";
import { Text } from "react-native-paper";
import Thumbnail from "../Thumbnail";
import layout from "../../utils/layout";
import FrostedGlass from "../FrostedGlass";

export default function Cast({ id, type, initialData }: { id: number; type: "movie" | "tv"; initialData?: any }) {
  const { data: fetchedData, isLoading } = useGetMovieKeyPeopleQuery(
    {
      id,
      type,
      actorLimit: 20,
      includeDirector: true,
    },
    { skip: !!initialData }
  );

  const data = initialData || fetchedData;

  if (!isLoading && !data?.actors?.length && !data?.directors?.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.actorsRow}>
        {data?.actors?.map((item, index) => (
          <FrostedGlass key={item.id.toString() + index} style={styles.card} container={{ marginBottom: 12 }}>
            <Thumbnail priority="low" size={200} path={item.profile_path || ""} container={styles.image} />

            <View style={styles.textWrap}>
              <Text style={styles.character} numberOfLines={1}>
                {item.character === "Self" ? item.name : item.character}
              </Text>
              <Text style={styles.actor} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          </FrostedGlass>
        ))}
      </View>

      <ScrollView horizontal style={{ marginTop: 30 }} showsHorizontalScrollIndicator={false} overScrollMode="never">
        {data?.directors?.map((item) => (
          <FrostedGlass key={item.id.toString()} style={styles.directorContainer} container={{ marginRight: 15 }}>
            {item.profile_path && <Thumbnail priority="low" path={item.profile_path} container={styles.directorImage} />}

            <View style={{ gap: 5, flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 22.5, fontFamily: "Bebas" }}>{item.name}</Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: 16,
                  fontFamily: "Bebas",
                }}
              >
                {item.job}
              </Text>
            </View>
          </FrostedGlass>
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_GAP = 12;
const CARD_WIDTH = Math.min(layout.screen.width * 0.5 - CARD_GAP * 1.5, 220);

const styles = StyleSheet.create({
  container: {
    minHeight: 400,
  },
  actorsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 0,
  },
  card: {
    width: CARD_WIDTH,
    padding: 12,
    borderRadius: 20,
    flex: 0,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.15,
    borderRadius: 10,
    marginBottom: 10,
  },
  textWrap: {
    paddingTop: 0,
  },
  character: {
    fontFamily: "Bebas",
    fontSize: 18,
    color: "#fff",
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
    alignItems: "center",
    flex: 0,
  },

  directorImage: {
    width: 60,
    height: 80,
    borderRadius: 10,
  },
});
