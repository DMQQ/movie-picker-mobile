import { useNavigation } from "@react-navigation/native";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import { Button, MD2DarkTheme } from "react-native-paper";
import useTranslation from "../service/useTranslation";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

interface MoviesActionButtonsProps {
  onScratchCardPress: () => void;

  match: boolean;

  fortuneWheelMovies: {
    id: number;
    poster_path: string | null;
    type?: "movie" | "tv";
  }[];

  fortuneWheelTitle?: string;

  containerStyle?: StyleProp<ViewStyle>;
}

export default function MoviesActionButtons({
  onScratchCardPress,
  match,
  fortuneWheelMovies,
  fortuneWheelTitle,

  containerStyle,
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
          bottom: 15,
          left: 15,
          right: 15,
          borderRadius: 100,
          zIndex: 10,
        },
        containerStyle,
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
          router.navigate({
            pathname: "/fortune",
            params: { movies: JSON.stringify(fortuneWheelMovies), title: fortuneWheelTitle },
          });
        }}
        buttonColor={MD2DarkTheme.colors.accent}
      >
        {t("favourites.wheel")}
      </Button>
    </LinearGradient>
  );
}
