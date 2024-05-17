import { useMemo } from "react";
import { Image, ScrollView, View } from "react-native";
import { Surface, Text } from "react-native-paper";

const WatchProviders = ({ providers }: { providers: any }) => {
  const providersList = useMemo(() => {
    let list = new Set();

    for (let key in providers) {
      for (let provider of providers[key]) {
        if (provider.logo_path !== undefined) list.add(provider.logo_path);
      }
    }

    return [...list];
  }, [providers]);

  if (providersList.length === 0) return null;

  return (
    <View style={{ marginVertical: 10, marginTop: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Streaming services (PL)
      </Text>

      <ScrollView horizontal>
        {providersList.map((provider) => (
          <Image
            key={provider as string}
            style={{
              width: 50,
              height: 50,
              borderRadius: 5,
              marginRight: 10,
              marginVertical: 15,
            }}
            resizeMode="cover"
            source={{
              uri: "https://image.tmdb.org/t/p/w500" + provider,
            }}
          />
        ))}
      </ScrollView>

      <Text style={{ color: "rgba(255,255,255,0.4)" }}>
        The movie availabilities are powered by JustWatch
      </Text>
    </View>
  );
};

export default WatchProviders;
