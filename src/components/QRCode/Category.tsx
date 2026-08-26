import { View } from "react-native";
import Text from "../Text";
import TextInput from "../TextInput";

import PrimaryButton from "../PrimaryButton";
import useTranslation from "../../service/useTranslation";
import { fontWeight, spacing } from "../../constants/design";

const categories = [
  "/discover/movie",
  "/movie/now_playing",
  "/movie/popular",
  "/movie/top_rated",
  "/movie/upcoming",
  "/tv/top_rated",
  "/tv/popular",
  "/tv/airing_today",
  "/tv/on_the_air",
  "/discover/tv",
];

export default function Category({
  pageRange,
  setPageRange,
  setCategory,
  handleGenerateCode,
  onNextOption,
}: {
  pageRange: string;
  setPageRange: Function;
  setCategory: Function;
  handleGenerateCode: Function;
  onNextOption: Function;
}) {
  const t = useTranslation();
  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View style={{ flexDirection: "column" }}>
        <Text style={{ fontSize: 25, fontWeight: fontWeight.bold, marginTop: spacing.xs + 1 }}>{t("room.choose-category")}</Text>
        <TextInput
          keyboardType="numeric"
          label={t("room.page-range")}
          value={pageRange.toString()}
          onChangeText={(text) => {
            setPageRange(text.replace(/[^0-9]/g, "").replace(/^0+/, ""));
          }}
          style={{ marginTop: spacing.sm + 2 }}
        />
      </View>

      <View>
        {categories.map((c, i) => (
          <PrimaryButton
            key={i}
            style={{ marginTop: spacing.sm + 2 }}
            onPress={() => {
              setCategory(c);
              handleGenerateCode(c);
              onNextOption();
            }}
          >
            {c}
          </PrimaryButton>
        ))}
      </View>
    </View>
  );
}
