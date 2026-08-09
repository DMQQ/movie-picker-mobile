import { useMemo } from "react";
import { View } from "react-native";
import Button from "../Button";
import useTranslation from "../../service/useTranslation";
import { radius, spacing } from "../../constants/design";

export default function PickCategory({
  setCategory,
  category,
}: {
  setCategory: any;
  category: string;
}) {
  const t = useTranslation();

  const categories = useMemo(
    () => [
      { label: t("voter.types.movie"), value: "movie" },
      { label: t("voter.types.series"), value: "Series" },
      { label: t("voter.types.mixed"), value: "Mixed" },
    ],
    [],
  );

  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: spacing.sm + 2,
        gap: spacing.screen,
        marginTop: spacing.screen,
      }}
    >
      {categories.map((item, index) => (
        <Button
          key={index}
          onPress={() => setCategory(item.value)}
          mode={category === item.value ? "contained" : "outlined"}
          style={{ flex: 1, borderRadius: radius.sm + 2 }}
        >
          {item.label}
        </Button>
      ))}
    </View>
  );
}
