import { StyleProp, StyleSheet, View, ViewStyle, Image, ImageProps } from "react-native";
import { MD2DarkTheme } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";

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
        <AntDesign name="picture" size={size} color={MD2DarkTheme.colors.placeholder} />
      </View>
    );
  }

  return (
    <View style={[styles.container, container]}>
      <Image
        resizeMode={"cover"}
        {...rest}
        source={{ uri: `https://image.tmdb.org/t/p/w${size}` + path, cache: "force-cache" }}
        style={[styles.image, rest.style]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { overflow: "hidden", backgroundColor: MD2DarkTheme.colors.surface },

  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
