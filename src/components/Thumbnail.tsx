import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Image, ImageProps } from "expo-image";
import { MD2DarkTheme, Text } from "react-native-paper";

interface ThumbnailProps extends ImageProps {
  path: string;
  size?: number;
  container?: StyleProp<ViewStyle>;
  priority?: "low" | "high" | "normal";

  alt?: string;
}

export const ThumbnailSizes = {
  poster: {
    tiny: 92,
    small: 154,
    medium: 185,
    large: 300,
    xlarge: 500,
    xxlarge: 780,
    original: "original",
  },
  backdrop: {
    small: 300,
    large: 780,
    xlarge: 1280,
    original: "original",
  },
  still: {
    tiny: 92,
    medium: 185,
    large: 300,
    original: "original",
  },
  profile: {
    tiny: 45,
    medium: 185,
    large: 632,
    original: "original",
  },
  logo: {
    tiny: 45,
    small: 92,
    medium: 154,
    large: 185,
    xlarge: 300,
    xxlarge: 500,
    original: "original",
  },
} as const;

const NoImage = ({ container, size = 200, ...rest }: Omit<ThumbnailProps, "path">) => (
  <View style={[styles.container, container]}>
    <View
      style={[styles.image, rest.style, { justifyContent: "center", alignItems: "center", backgroundColor: MD2DarkTheme.colors.surface }]}
    >
      <MaterialCommunityIcons name="image-broken-variant" size={size / 3} color={MD2DarkTheme.colors.placeholder} />

      <Text style={{ color: MD2DarkTheme.colors.placeholder, marginTop: 8, textAlign: "center" }} variant="bodyMedium">
        {rest.alt || "No Image Available"}
      </Text>
    </View>
  </View>
);

export default function Thumbnail({ path, size = 200, container, priority = "normal", ...rest }: ThumbnailProps) {
  if (!path) {
    return <NoImage size={size} container={container} {...rest} />;
  }

  return (
    <View style={[styles.container, container]}>
      {rest.alt && <Text style={styles.altText}>{rest.alt}</Text>}
      <Image
        {...rest}
        priority={priority}
        source={{
          uri: `https://image.tmdb.org/t/p/w${size}` + path,
        }}
        style={[styles.image, rest.style]}
        placeholder={`https://image.tmdb.org/t/p/w${ThumbnailSizes.poster.tiny}` + path}
        placeholderContentFit="cover"
        // cachePolicy={Platform.OS === "android" ? "disk" : "memory-disk"}
        cachePolicy={"disk"}
        recyclingKey={path}
        contentFit="cover"
        transition={200}
      />
    </View>
  );
}

export async function prefetchThumbnail(path: string, size: number = 200) {
  if (!path) return;
  const imageUrl = `https://image.tmdb.org/t/p/w${size}` + path;
  Image.prefetch(imageUrl);
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", justifyContent: "center", alignItems: "center" },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    zIndex: 5,
  },
  altContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  altText: {
    color: "white",
    fontFamily: "Bebas",
    textAlign: "center",
    position: "absolute",
    width: "100%",
  },
});
