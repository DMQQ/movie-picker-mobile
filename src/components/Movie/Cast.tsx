import { View, StyleSheet, ScrollView } from "react-native";
import Text from "../Text";
import { useGetMovieKeyPeopleQuery } from "../../redux/person/personApi";
import { Link } from "expo-router";

import Touch from "../Touch";
import Thumbnail from "../Thumbnail";
import FrostedGlass from "../FrostedGlass";
import { colors, fontSize, radius, spacing } from "../../constants/design";

export default function Cast({ id, type, initialData }: { id: number; type: "movie" | "tv"; initialData?: any }) {
  const { data: fetchedData, isLoading } = useGetMovieKeyPeopleQuery(
    { id, type, actorLimit: 20, includeDirector: true },
    { skip: !!initialData }
  );

  const data = initialData || fetchedData;

  if (!isLoading && !data?.actors?.length && !data?.directors?.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.actorsRow}>
        {data?.actors?.map((item, index) => (
          <Link
            key={item.id.toString() + index}
            href={{ pathname: "/person/[id]", params: { id: item.id, img: item.profile_path || "" } }}
            style={styles.card}
            asChild
          >
            <Touch>
              <Link.Trigger>
                <View>
                  <Link.AppleZoom>
                    <Thumbnail priority="low" size={200} path={item.profile_path || ""} container={styles.image} />
                  </Link.AppleZoom>
                  <View style={styles.textWrap}>
                    <Text style={styles.character} numberOfLines={1}>
                      {item.character === "Self" ? item.name : item.character}
                    </Text>
                    <Text style={styles.actor} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                </View>
              </Link.Trigger>
              <Link.Preview />
            </Touch>
          </Link>
        ))}
      </View>

      <ScrollView horizontal style={{ marginTop: spacing.xxl + 6 }} showsHorizontalScrollIndicator={false} overScrollMode="never">
        {data?.directors?.map((item) => (
          <FrostedGlass key={item.id.toString()} style={styles.directorContainer} container={{ marginRight: spacing.screen }}>
            {item.profile_path && <Thumbnail priority="low" path={item.profile_path} container={styles.directorImage} />}
            <View style={{ gap: spacing.xs + 1, flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 22.5, fontFamily: "Bebas" }}>{item.name}</Text>
              <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: fontSize.lg, fontFamily: "Bebas" }}>
                {item.job}
              </Text>
            </View>
          </FrostedGlass>
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_GAP = 8;

const styles = StyleSheet.create({
  container: {
    minHeight: 400,
  },
  actorsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radius.xs + 1,
    overflow: "hidden",
    marginBottom: CARD_GAP,
  },
  image: {
    width: "100%",
    aspectRatio: 2 / 3,
  },
  textWrap: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  character: {
    fontFamily: "Bebas",
    fontSize: fontSize.lg,
    color: colors.text,
  },
  actor: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.7)",
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
