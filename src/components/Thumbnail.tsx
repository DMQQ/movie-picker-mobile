import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Image, ImageProps } from "expo-image";
import { MD2DarkTheme } from "react-native-paper";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function Thumbnail({
  path,
  size = 200,
  container,
  ...rest
}: { path: string; size?: number; container?: StyleProp<ViewStyle> } & ImageProps) {
  return (
    <View style={[styles.container, container]}>
      <Image
        contentFit="cover"
        placeholder={blurhash}
        transition={400}
        cachePolicy={"memory-disk"}
        {...rest}
        source={{ uri: `https://image.tmdb.org/t/p/w${size}` + path }}
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
