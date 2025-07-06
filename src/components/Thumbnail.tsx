import { StyleProp, StyleSheet, View, ViewStyle, Image, ImageProps } from "react-native";
import { MD2DarkTheme } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { sharedElementTransition } from "../service/utils/SharedElementTransition";

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

export default function Thumbnail({
  path,
  size = 200,
  container,
  priority,
  ...rest
}: { path: string; size?: number; container?: StyleProp<ViewStyle>; priority?: "low" | "high" | "normal" } & ImageProps) {
  if (!path) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }, container]}>
        <AntDesign name="picture" size={size / 3} color={MD2DarkTheme.colors.placeholder} />
      </View>
    );
  }

  return (
    <View style={[styles.container, container]}>
      <Animated.Image
        resizeMode={"cover"}
        {...rest}
        source={{ uri: `https://image.tmdb.org/t/p/w${size}` + path, cache: "force-cache" }}
        style={[styles.image, rest.style]}
      />
    </View>
  );
}

export async function prefetchThumbnail(path: string, size: number = 200) {
  if (!path) return;

  const imageUrl = `https://image.tmdb.org/t/p/w${size}` + path;
  await Image.prefetch(imageUrl);
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", backgroundColor: MD2DarkTheme.colors.surface },

  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
