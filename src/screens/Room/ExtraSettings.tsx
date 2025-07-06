import { FlatList, Image, View, StyleSheet, Dimensions } from "react-native";
import { Appbar, Button, IconButton, MD2DarkTheme, Text, TouchableRipple } from "react-native-paper";
import { useMemo, useState } from "react";
import useTranslation from "../../service/useTranslation";
import { useGetAllProvidersQuery } from "../../redux/movie/movieApi";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useCreateRoom } from "./ContextProvider";
import PageHeading from "../../components/PageHeading";
import { getConstrainedDimensions } from "../../utils/getConstrainedDimensions";

export default function ExtraSettings({ navigation }: any) {
  const t = useTranslation();
  const { setProviders, providers } = useCreateRoom();

  const [selectedProviders, setSelectedProviders] = useState<number[]>(providers);
  const { data } = useGetAllProvidersQuery({});

  const toggleProvider = (providerId: number) => {
    setSelectedProviders((prev) => (prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId]));
  };

  const numberOfColumns = useMemo(() => {
    const container = getConstrainedDimensions("window").width - 30;
    const gap = 5;
    const size = 70;

    return Math.floor(container / (size + gap));
  }, [data?.length]);

  return (
    <SafeIOSContainer style={styles.container}>
      <PageHeading title={t("room.providers")} />
      <Text style={{ padding: 10, color: "gray", marginBottom: 15, fontSize: 16 }}>{t("room.provider_desc")}</Text>

      <View style={styles.content}>
        <View style={styles.providersContainer}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.provider_id.toString()}
            numColumns={numberOfColumns}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <TouchableRipple
                onPress={() => toggleProvider(item.provider_id)}
                style={[styles.providerWrapper, selectedProviders.includes(item.provider_id) && styles.selectedProvider]}
              >
                <Image source={{ uri: `https://image.tmdb.org/t/p/w300${item?.logo_path}` }} style={[styles.providerLogo]} />
              </TouchableRipple>
            )}
          />
        </View>

        <View>
          <Button
            mode="contained"
            style={styles.button}
            contentStyle={styles.buttonContent}
            onPress={() => {
              setProviders(selectedProviders);
              navigation.navigate("ChoosePage");
            }}
          >
            {t("room.next")}
          </Button>
        </View>
      </View>
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    backgroundColor: "#000",
  },
  content: {
    paddingHorizontal: 15,
    flex: 1,
  },
  providersContainer: {
    flex: 1,
  },
  title: {
    fontSize: 45,
    lineHeight: 45,
    fontFamily: "Bebas",
    marginBottom: 20,
  },
  grid: {
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  providerWrapper: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1a1a1a",
  },
  selectedProvider: {
    borderColor: MD2DarkTheme.colors.primary,
  },
  providerLogo: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  button: {
    borderRadius: 100,
    marginTop: 10,
  },
  buttonContent: {
    padding: 7.5,
  },
});
