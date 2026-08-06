import { useNavigation } from "expo-router";
import { colors } from "../constants/design";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PrimaryButton from "./PrimaryButton";
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
      <PrimaryButton
        disabled={fortuneWheelMovies.length === 0}
        style={{ flex: 1 }}
        onPress={onScratchCardPress}
      >
        {match ? t("likes.close") : t("favourites.scratch-card")}
      </PrimaryButton>

      <PrimaryButton
        disabled={fortuneWheelMovies.length === 0}
        style={{ flex: 1 }}
        icon={({ color }) => <MaterialCommunityIcons name="dice-5" size={16} color={color} />}
        buttonColor={colors.accent}
        onPress={() => {
          router.navigate({
            pathname: "/fortune",
            params: { movies: JSON.stringify(fortuneWheelMovies), title: fortuneWheelTitle },
          });
        }}
      >
        {t("favourites.wheel")}
      </PrimaryButton>
    </LinearGradient>
  );
}
