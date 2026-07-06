import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import { Movie } from "../../types";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import { Link } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import Touch from "./Touch";

const getColor = (score: number) => {
  if (score >= 7) return "#21d07a"; // Green
  if (score >= 4) return "#d2d531"; // Yellow
  return "#db2360"; // Red
};

interface SectionListItemProps {
  id: number;
  type?: string;
  poster_path: string;
  vote_average: number;
  title?: string;
  name?: string;
  genres?: { id: number; name: string }[] | string[];
  imageWidth?: number;
  isFlashListItem?: boolean;
  mapped_genres?: string[];
  hideTitle?: boolean;
  thumbnailSize?: number;
}

function getGenres(
  genres: { id: number; name: string }[] | string[] | undefined,
) {
  if (!genres) return [];

  if (typeof genres[0] === "string") {
    return genres as string[];
  }

  return (genres as { id: number; name: string }[]).map((genre) => genre.name);
}

export const SectionListItem = ({
  poster_path,
  vote_average,
  name,
  title,
  imageWidth,
  genres,
  mapped_genres,
  hideTitle = false,
  thumbnailSize = ThumbnailSizes.poster.small,
  ...rest
}: SectionListItemProps) => {
  const genreNames = getGenres(genres || mapped_genres);
  const sizes =
    imageWidth !== undefined ? getSectionItemSize(imageWidth, hideTitle) : null;

  return (
    <Link
      href={{
        pathname: "/movie/type/[type]/[id]",
        params: {
          id: rest.id,
          type: rest.type === "tv" ? "tv" : "movie",
          img: poster_path,
        },
      }}
      style={[
        sectionStyles.item,
        sizes?.item,
        !imageWidth && { marginRight: 15 },
      ]}
      asChild
    >
      <Touch>
        <Link.Trigger>
          <View>
            <Link.AppleZoom>
              <Thumbnail
                path={poster_path}
                size={thumbnailSize}
                container={[sectionStyles.image, sizes?.image]}
                alt={name || title}
                showsPlaceholder={false}
                priority="low"
              />
            </Link.AppleZoom>
            {vote_average > 0 && (
              <View
                style={[
                  sectionStyles.badgeContainer,
                  { backgroundColor: getColor(vote_average || 0) },
                ]}
              >
                <Text
                  style={[
                    sectionStyles.badgeItem,
                    {
                      color:
                        vote_average < 4
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(0,0,0,0.9)",
                    },
                  ]}
                >
                  <AntDesign name="star" size={9} color="#000" />{" "}
                  {vote_average.toFixed(1)}
                </Text>
              </View>
            )}
            {!hideTitle && (
              <View
                style={{
                  marginTop: 10,
                  paddingHorizontal: 10,
                  maxWidth: sizes?.image.width || sectionStyles.image.width,
                }}
              >
                <Text
                  variant="bodyMedium"
                  numberOfLines={1}
                  style={{
                    maxWidth: sectionStyles.image.width,
                    fontSize: 16,
                    fontFamily: "Bebas",
                  }}
                >
                  {name || title}
                </Text>

                <Text
                  numberOfLines={2}
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}
                >
                  {genreNames.join(", ")}
                </Text>
              </View>
            )}
          </View>
        </Link.Trigger>

        <Link.Preview />
      </Touch>
    </Link>
  );
};

const { width } = Dimensions.get("screen");

export const SECTION_ITEM_WIDTH = Math.min(width * 0.35, 200);
export const SECTION_ITEM_HEIGHT = Math.min(width * 0.3, 200) * 1.5 + 70;

export const getSectionItemSize = (imageWidth?: number, hideTitle = false) => {
  const itemWidth = imageWidth ?? SECTION_ITEM_WIDTH;
  const imageHeight = itemWidth * 1.5;
  const itemHeight = imageHeight + (hideTitle ? 0 : 70);

  return {
    item: { width: itemWidth, height: itemHeight },
    image: { width: itemWidth, height: imageHeight },
  };
};

const sectionStyles = StyleSheet.create({
  item: {
    position: "relative",
    overflow: "hidden",
    width: SECTION_ITEM_WIDTH,
    height: SECTION_ITEM_HEIGHT,
    backgroundColor: MD2DarkTheme.colors.surface,
    borderRadius: 5,
  },

  image: {
    width: SECTION_ITEM_WIDTH,
    height: SECTION_ITEM_HEIGHT - 70,
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
