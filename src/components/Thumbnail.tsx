import { AntDesign } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import FastImage, { FastImageProps } from "react-native-fast-image";
import { MD2DarkTheme } from "react-native-paper";

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

const priorityMap = {
  low: FastImage.priority.low,
  normal: FastImage.priority.normal,
  high: FastImage.priority.high,
};

const BlurPlaceholder = ({ children, placeholder, style }: PropsWithChildren<{ placeholder?: string; style: StyleProp<ViewStyle> }>) =>
  placeholder ? (
    <ImageBackground source={{ uri: placeholder }} style={[style]}>
      {children}
    </ImageBackground>
  ) : (
    <View style={[style]}>{children}</View>
  );

export default function Thumbnail({
  path,
  size = 200,
  container,
  priority = "normal",
  placeholder,
  ...rest
}: {
  path: string;
  size?: number;
  container?: StyleProp<ViewStyle>;
  priority?: "low" | "high" | "normal";
  placeholder?: string;
} & FastImageProps) {
  if (!path) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }, container]}>
        <AntDesign name="picture" size={size / 3} color={MD2DarkTheme.colors.placeholder} />
      </View>
    );
  }

  return (
    <BlurPlaceholder placeholder={placeholder} style={[styles.container, container]}>
      <FastImage
        {...rest}
        source={{
          uri: `https://image.tmdb.org/t/p/w${size}` + path,
          priority: priorityMap[priority],
        }}
        resizeMode={FastImage.resizeMode.cover}
        style={[styles.image, rest.style]}
      />
    </BlurPlaceholder>
  );
}

export async function prefetchThumbnail(path: string, size: number = 200) {
  if (!path) return;
  const imageUrl = `https://image.tmdb.org/t/p/w${size}` + path;
  FastImage.preload([{ uri: imageUrl }]);
}

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
