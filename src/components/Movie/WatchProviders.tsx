import { useMemo } from "react";
import { Image, ScrollView, StyleProp, View, ViewStyle } from "react-native";
import { Surface, Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import Thumbnail from "../Thumbnail";

const WatchProviders = ({ providers, hideLabel = false, style }: { providers: any; hideLabel?: boolean; style?: StyleProp<ViewStyle> }) => {
  const providersList = useMemo(() => {
    let list = new Set();

    for (let key in providers) {
      for (let provider of providers[key]) {
        if (provider.logo_path !== undefined) list.add(provider.logo_path);
      }
    }

    return [...list];
  }, [providers]);

  const t = useTranslation();

  if (providersList.length === 0) return null;

  return (
    <View style={[{ marginTop: 30 }, style]}>
      {!hideLabel && <Text style={{ fontSize: 35, fontFamily: "Bebas", lineHeight: 35 }}>Streaming</Text>}

      <ScrollView horizontal style={{ marginVertical: 7.5 }} showsHorizontalScrollIndicator={false}>
        {providersList.map((provider) => (
          <Thumbnail
            key={provider as string}
            container={{
              width: 50,
              height: 50,
              borderRadius: 5,
              marginRight: 10,
            }}
            path={provider as string}
          />
        ))}
      </ScrollView>

      <Text style={{ color: "rgba(255,255,255,0.8)" }}>{t("global.justwatch")}</Text>
    </View>
  );
};

export default WatchProviders;
