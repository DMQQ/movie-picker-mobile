import { Image, useWindowDimensions } from "react-native";

export default function Poster(props: {
  card: {
    poster_path: string;
  };
}) {
  const { height, width } = useWindowDimensions();
  return (
    <Image
      style={{
        height: height * 0.3,
        width: width * 0.9 - 20,
        borderRadius: 19,
      }}
      resizeMode="cover"
      source={{
        uri: "https://image.tmdb.org/t/p/w500" + props.card.poster_path,
      }}
    />
  );
}
