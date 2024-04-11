import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

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
  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View style={{ flexDirection: "column" }}>
        <Text style={{ fontSize: 25, fontWeight: "bold", marginTop: 5 }}>
          Choose category
        </Text>
        <TextInput
          keyboardType="numeric"
          mode="outlined"
          label={"Page Range"}
          value={pageRange.toString()}
          onChangeText={(text) => {
            setPageRange(text.replace(/[^0-9]/g, "").replace(/^0+/, ""));
          }}
          style={{ marginTop: 10 }}
        />
      </View>

      <View>
        {categories.map((c, i) => (
          <Button
            key={i}
            mode="contained"
            contentStyle={{ padding: 5 }}
            style={{ marginTop: 10, borderRadius: 10 }}
            onPress={() => {
              setCategory(c);
              handleGenerateCode(c);
              onNextOption();
            }}
          >
            {c}
          </Button>
        ))}
      </View>
    </View>
  );
}
