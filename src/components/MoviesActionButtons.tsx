import { useNavigation } from "@react-navigation/native";
import { Platform, View } from "react-native";
import { Button, MD2DarkTheme } from "react-native-paper";
import useTranslation from "../service/useTranslation";
import { LinearGradient } from "expo-linear-gradient";

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
    <LinearGradient
      style={[
        Platform.OS === "android" && {},
        {
          flexDirection: "row",
          gap: 15,
          position: "absolute",
          bottom: 0,
          left: 15,
          right: 15,
          borderRadius: 100,
          zIndex: 10,
        },
      ]}
      colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"]}
    >
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
    </LinearGradient>
  );
}
