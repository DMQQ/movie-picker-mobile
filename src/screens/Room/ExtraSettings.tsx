import { FlatList, Image, View, StyleSheet, Dimensions } from "react-native";
import { Appbar, Button, Text, TouchableRipple } from "react-native-paper";
import { useMemo, useState } from "react";
import useTranslation from "../../service/useTranslation";
import { useGetAllProvidersQuery } from "../../redux/movie/movieApi";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useCreateRoom } from "./ContextProvider";

export default function ExtraSettings({ navigation }: any) {
  const t = useTranslation();
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const { data } = useGetAllProvidersQuery({});

  const { setProviders } = useCreateRoom();

  const toggleProvider = (providerId: number) => {
    setSelectedProviders((prev) => (prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId]));
  };

  const numberOfColumns = useMemo(() => {
    const container = Dimensions.get("window").width - 30;
    const gap = 5;
    const size = 70;

    return Math.floor(container / (size + gap));
  }, [data?.length]);

  return (
    <SafeIOSContainer style={styles.container}>
      <Appbar style={styles.appbar}>
        <Appbar.BackAction onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Landing"))} />
        <Appbar.Content title={t("room.titles.extra-settings")} />
      </Appbar>

      <View style={styles.content}>
        <View style={styles.providersContainer}>
          <Text style={styles.title}>{t("room.providers")}</Text>

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
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w300${item?.logo_path}` }}
                  style={[
                    styles.providerLogo,
                    {
                      width: 55,
                      height: 55,
                    },
                  ]}
                />
              </TouchableRipple>
            )}
          />
        </View>

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
    padding: 15,
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
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#1a1a1a",
  },
  selectedProvider: {
    borderColor: "#007AFF",
    backgroundColor: "#1a1a1a80",
  },
  providerLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  button: {
    borderRadius: 100,
    marginTop: 10,
  },
  buttonContent: {
    padding: 7.5,
  },
});
