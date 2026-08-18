import { memo } from "react";
import Text from "../Text";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { Movie } from "../../../types";
import SectionListItem from "../SectionItem";
import { colors, fontSize, fontWeight, spacing, typography } from "../../constants/design";
import { useRouter } from "expo-router";

interface SectionProps {
  group: { name: string; results: Movie[] };
}

const { width: screenWidth } = Dimensions.get("screen");

const COMPACT_W = Math.round(Math.min(screenWidth * 0.27, 130));
const COMPACT_H = Math.round(COMPACT_W * 1.5);

const SECTION_GAP = spacing.xl;
export const SECTION_HEIGHT = COMPACT_H + 60 + SECTION_GAP;

const sectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    height: SECTION_HEIGHT,
    marginBottom: SECTION_GAP,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 2,
  },
  title: {
    color: colors.text,
    fontSize: typography.bebasSize.section,
    fontFamily: "Bebas",
  },
  showAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.placeholder,
    letterSpacing: 0.4,
  },
});

const renderItem = ({ item }: ListRenderItemInfo<Movie>) => (
  <SectionListItem {...item} imageWidth={COMPACT_W} hideTitle={true} />
);

const movieKeyExtractor = (item: Movie) => `${item.id}-${item.type}`;

export const Section = memo(
  ({ group }: SectionProps) => {
    const router = useRouter();

    if (group.results.length === 0) return null;

    const handleShowAll = () => {
      router.push({ pathname: "/section-movies", params: { name: group.name } });
    };

    return (
      <View style={sectionStyles.container}>
        <View style={sectionStyles.header}>
          <Text style={sectionStyles.title}>{group.name}</Text>
          <Pressable onPress={handleShowAll} hitSlop={8}>
            <Text style={sectionStyles.showAll}>Show all {">"}</Text>
          </Pressable>
        </View>

        <FlashList
          data={group.results}
          renderItem={renderItem}
          keyExtractor={movieKeyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={COMPACT_W + spacing.sm}
          ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
        />
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.group.name === nextProps.group.name &&
    prevProps.group.results.length === nextProps.group.results.length,
);

export default Section;
