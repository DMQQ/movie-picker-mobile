import { View, StyleSheet, ScrollView } from "react-native";
import Text from "../Text";
import { useGetMovieKeyPeopleQuery } from "../../redux/person/personApi";

import Thumbnail from "../Thumbnail";
import layout from "../../utils/layout";
import FrostedGlass from "../FrostedGlass";
import { colors, fontSize, radius, spacing} from "../../constants/design";

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
          <FrostedGlass key={item.id.toString() + index} style={styles.card} container={{ marginBottom: spacing.md, width: CARD_WIDTH }}>
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

      <ScrollView horizontal style={{ marginTop: spacing.xxl + 6 }} showsHorizontalScrollIndicator={false} overScrollMode="never">
        {data?.directors?.map((item) => (
          <FrostedGlass key={item.id.toString()} style={styles.directorContainer} container={{ marginRight: spacing.screen }}>
            {item.profile_path && <Thumbnail priority="low" path={item.profile_path} container={styles.directorImage} />}

            <View style={{ gap: spacing.xs + 1, flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 22.5, fontFamily: "Bebas" }}>{item.name}</Text>

              <Text
                style={{
                  color: "rgba(255,255,255,0.95)",
                  fontSize: fontSize.lg,
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
    padding: spacing.md,
    borderRadius: radius.modal,
    flex: 0,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.15,
    borderRadius: radius.sm + 2,
    marginBottom: spacing.sm + 2,
  },
  textWrap: {
    paddingTop: 0,
  },
  character: {
    fontFamily: "Bebas",
    fontSize: fontSize.xl,
    color: colors.text,
  },
  actor: {
    fontSize: fontSize.md,
    color: "#ccc",
  },

  directorContainer: {
    padding: spacing.screen,
    flexDirection: "row",
    gap: spacing.screen,
    borderRadius: radius.pill,
    alignItems: "center",
    flex: 0,
  },

  directorImage: {
    width: 60,
    height: 80,
    borderRadius: radius.sm + 2,
  },
});
