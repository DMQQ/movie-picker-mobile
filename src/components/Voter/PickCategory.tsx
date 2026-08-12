import { useMemo } from "react";
import { View } from "react-native";
import Chip from "../Chip";
import useTranslation from "../../service/useTranslation";
import { spacing } from "../../constants/design";

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
        flexWrap: "wrap",
        gap: spacing.sm,
      }}
    >
      {categories.map((item) => (
        <Chip
          key={item.value}
          selected={category === item.value}
          onPress={() => setCategory(item.value)}
        >
          {item.label}
        </Chip>
      ))}
    </View>
  );
}
