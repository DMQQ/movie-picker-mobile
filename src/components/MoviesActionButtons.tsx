import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { Button, MD2DarkTheme } from "react-native-paper";
import useTranslation from "../service/useTranslation";

interface MoviesActionButtonsProps {
  onScratchCardPress: () => void;

  match: boolean;

  fortuneWheelMovies: {
    id: number;
    poster_path: string | null;
  }[];

  fortuneWheelTitle?: string;
}

export default function MoviesActionButtons({
  onScratchCardPress,
  match,
  fortuneWheelMovies,
  fortuneWheelTitle,
}: MoviesActionButtonsProps) {
  const navigation = useNavigation<any>();
  const t = useTranslation();

  return (
    <View style={{ paddingHorizontal: 15, paddingTop: 15, flexDirection: "row", gap: 15 }}>
      <Button
        disabled={fortuneWheelMovies.length === 0}
        mode="contained"
        style={{ borderRadius: 100, flex: 1 }}
        contentStyle={{ padding: 7.5 }}
        onPress={onScratchCardPress}
      >
        {match ? t("likes.close") : t("favourites.scratch-card")}
      </Button>

      <Button
        disabled={fortuneWheelMovies.length === 0}
        style={{ borderRadius: 100, flex: 1 }}
        contentStyle={{ padding: 7.5 }}
        icon={"dice-5"}
        mode="contained"
        onPress={() => {
          navigation.navigate("Fortune", {
            screen: "FortuneWheel",
            params: { movies: fortuneWheelMovies, title: fortuneWheelTitle },
          });
        }}
        buttonColor={MD2DarkTheme.colors.accent}
      >
        {t("favourites.wheel")}
      </Button>
    </View>
  );
}
