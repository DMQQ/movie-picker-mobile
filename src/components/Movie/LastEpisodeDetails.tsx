import { Image, View } from "react-native";
import { Surface, Text } from "react-native-paper";

const LastEpisodeToAir = ({ lastEpisode }: { lastEpisode: any }) => {
  if (
    lastEpisode === undefined ||
    lastEpisode === null ||
    lastEpisode?.name === undefined
  )
    return null;

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 20 }}>Last Episode To Air</Text>
      <Surface style={{ padding: 7.5, borderRadius: 12.5, marginTop: 10 }}>
        <Image
          style={{
            width: "100%",
            height: 150,
            borderRadius: 10,
          }}
          resizeMode="cover"
          source={{
            uri: "https://image.tmdb.org/t/p/w500" + lastEpisode.still_path,
          }}
        />
        <View style={{ paddingVertical: 5 }}>
          <Text
            style={{
              fontSize: 15,
              textTransform: "uppercase",
            }}
          >
            {lastEpisode.name}
            {"  "}
            <Text style={{ color: "gray" }}>{lastEpisode.air_date}</Text>
          </Text>

          <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
            Episode {lastEpisode.episode_number} Season{" "}
            {lastEpisode.season_number}
          </Text>

          <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
            {lastEpisode.overview}
          </Text>
        </View>
      </Surface>
    </View>
  );
};

export default LastEpisodeToAir;
