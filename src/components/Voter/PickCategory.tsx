import { useMemo } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import useTranslation from "../../service/useTranslation";

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
        paddingVertical: 10,
        gap: 15,
        marginTop: 15,
      }}
    >
      {categories.map((item, index) => (
        <Button
          key={index}
          onPress={() => setCategory(item.value)}
          mode={category === item.value ? "contained" : "outlined"}
          style={{ flex: 1, borderRadius: 10 }}
        >
          {item.label}
        </Button>
      ))}
    </View>
  );
}
