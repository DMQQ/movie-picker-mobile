import { Dimensions, StyleSheet, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import { Movie } from "../../types";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import { Link } from "expo-router";

const getColor = (score: number) => {
  if (score >= 7) return "#21d07a"; // Green
  if (score >= 4) return "#d2d531"; // Yellow
  return "#db2360"; // Red
};

interface SectionListItemProps extends Movie {
  href: { pathname: string; params: Record<string, any> };

  imageWidth?: number;

  isFlashListItem?: boolean;
}

export const SectionListItem = ({ poster_path, vote_average, name, title, href, imageWidth }: SectionListItemProps) => {
  return (
    <Link href={href as any} push style={[!imageWidth && { marginRight: 15 }]}>
      <Link.Trigger>
        <View style={[sectionStyles.item]}>
          <Thumbnail
            path={poster_path}
            size={ThumbnailSizes.poster.small}
            container={[
              sectionStyles.image,

              imageWidth !== undefined
                ? {
                    width: imageWidth,
                    height: imageWidth * 1.5,
                  }
                : undefined,
            ]}
            alt={name || title}
            showsPlaceholder={false}
            priority="low"
          />
          {vote_average > 0 && (
            <View style={[sectionStyles.badgeContainer, { backgroundColor: getColor(vote_average || 0) }]}>
              <Text
                style={[
                  sectionStyles.badgeItem,
                  {
                    color: vote_average < 4 ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.9)",
                  },
                ]}
              >
                {vote_average ? Math.trunc(vote_average * 10) + "%" : "N/A"}
              </Text>
            </View>
          )}
        </View>
      </Link.Trigger>

      <Link.Preview />
    </Link>
  );
};

const { width } = Dimensions.get("screen");

const sectionStyles = StyleSheet.create({
  item: {
    position: "relative",
    overflow: "hidden",
  },

  image: {
    width: Math.min(width * 0.25, 200),
    height: Math.min(width * 0.25, 200) * 1.5,
    borderRadius: 5,
  },

  badgeContainer: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: MD2DarkTheme.colors.surface,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
  },

  badgeItem: {
    fontSize: 10,
    transform: [{ skewX: "10deg" }],
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
  },
});

export default SectionListItem;
