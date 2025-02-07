import { Text, View } from "react-native";
import TilesList from "../components/Overview/TilesList";
import { useAppSelector } from "../redux/store";
import { Appbar, IconButton } from "react-native-paper";
import useTranslation from "../service/useTranslation";

export default function Group({ navigation, route }: any) {
  const { group } = route.params;

  const groups = useAppSelector((st) => st.favourite.groups);

  const data = groups.find((g) => g.id === group.id);

  const t = useTranslation();

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={35} />

        <Text style={{ fontFamily: "Bebas", fontSize: 40, textAlign: "center", width: "70%", color: "#fff" }}>{data?.name}</Text>
      </View>
      <TilesList
        data={
          data?.movies.map((m) => ({
            ...m,
            poster_path: m.imageUrl,
          })) || []
        }
        label=""
      />
    </View>
  );
}
