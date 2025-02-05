import { View } from "react-native";
import { useAppSelector } from "../redux/store";
import SafeIOSContainer from "../components/SafeIOSContainer";
import TilesList from "../components/Overview/TilesList";
import { Appbar, Button, IconButton, Text } from "react-native-paper";
import { ScreenProps } from "./types";
import useTranslation from "../service/useTranslation";

export default function Favourites({ navigation }: ScreenProps<"Favourites">) {
  const { movies } = useAppSelector((state) => state.favourite);

  const t = useTranslation();

  return (
    <SafeIOSContainer style={{ marginTop: 0 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={35} />

        <Text style={{ fontFamily: "Bebas", fontSize: 40, textAlign: "center", width: "70%" }}>{t("favourites.title")}</Text>
      </View>
      <View style={{ padding: 15 }}>
        <TilesList useMovieType label="" data={movies} />
      </View>
    </SafeIOSContainer>
  );
}
