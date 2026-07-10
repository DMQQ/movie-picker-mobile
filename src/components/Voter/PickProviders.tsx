import { Dimensions, FlatList, Image } from "react-native";
import { MD2DarkTheme, TouchableRipple } from "react-native-paper";
import { useGetAllProvidersQuery } from "../../redux/movie/movieApi";

const MARGIN = 8;
const CONTAINER_PADDING = 16;
const NUM_COLUMNS = 5;
const totalHorizontalPadding = CONTAINER_PADDING * 2;
const totalMargins = MARGIN * (NUM_COLUMNS - 1);
const size = Math.floor(
  (Dimensions.get("screen").width - totalHorizontalPadding - totalMargins) /
    NUM_COLUMNS,
);

export default function PickProviders({
  providers,
  setProviders,
}: {
  setProviders: any;
  providers: number[];
}) {
  const { data } = useGetAllProvidersQuery({});

  return (
    <FlatList
      style={{ marginTop: 15, paddingHorizontal: CONTAINER_PADDING }}
      contentContainerStyle={{ alignItems: "center" }}
      numColumns={NUM_COLUMNS}
      keyExtractor={(i) => i.provider_id.toString()}
      data={data}
      renderItem={({ item }) => (
        <TouchableRipple
          onPress={() =>
            setProviders((p: number[]) =>
              p.includes(item.provider_id)
                ? p.filter((i) => i !== item.provider_id)
                : [...p, item.provider_id],
            )
          }
          style={{
            borderWidth: 2,
            borderColor: providers.includes(item.provider_id)
              ? MD2DarkTheme.colors.primary
              : "transparent",
            borderRadius: 10,
            margin: MARGIN / 2,
            width: size,
            height: size,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w200${item?.logo_path}` }}
            style={{ width: size - 4, height: size - 4, borderRadius: 7.5 }}
            resizeMode="contain"
          />
        </TouchableRipple>
      )}
    />
  );
}
