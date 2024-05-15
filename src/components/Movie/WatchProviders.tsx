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
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 20 }}>Watch Providers {providers.length}</Text>

      <ScrollView horizontal>
        <Surface
          style={{
            padding: 7.5,
            borderRadius: 12.5,
            marginTop: 10,
            width: providersList.length * (40 + 12),
            flexDirection: "row",
          }}
        >
          {providersList.map((provider) => (
            <Image
              key={provider as string}
              style={{
                width: 40,
                height: 40,
                borderRadius: 5,
                marginRight: 10,
              }}
              resizeMode="cover"
              source={{
                uri: "https://image.tmdb.org/t/p/w500" + provider,
              }}
            />
          ))}
        </Surface>
      </ScrollView>
    </View>
  );
};

export default WatchProviders;
