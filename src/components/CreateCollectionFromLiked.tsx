import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "./Text";
import { Pressable, View } from "react-native";

import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";
import { setPendingBulkMovies } from "../redux/favourites/favourites";
import { useAppDispatch } from "../redux/store";
import useTranslation from "../service/useTranslation";
import { router } from "expo-router";

interface CreateCollectionFromLikedProps {
  data: any[];
  beforeCreate?: () => void;
}

export default function CreateCollectionFromLiked({
  data,
  beforeCreate,
}: CreateCollectionFromLikedProps) {
  const dispatch = useAppDispatch();
  const t = useTranslation();

  const handleOpen = () => {
    if (!data.length) return;
    beforeCreate?.();
    dispatch(setPendingBulkMovies(data));
    router.push("/favourite-groups");
  };

  return (
    <Pressable onPress={handleOpen}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.screen,
          paddingVertical: spacing.sm + 2,
          borderRadius: radius.pill,
          borderWidth: 1,
          gap: spacing.xs + 1,
          borderColor: colors.primary,
        }}
      >
        <MaterialCommunityIcons
          name="bookmark"
          color={colors.primary}
          size={16}
        />
        <Text
          style={{
            color: colors.primary,
            fontWeight: fontWeight.bold,
            fontSize: fontSize.md,
          }}
        >
          {t("overview.save-list")}
        </Text>
      </View>
    </Pressable>
  );
}
