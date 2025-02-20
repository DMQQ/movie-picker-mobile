import { Platform, Text, View } from "react-native";
import TilesList from "../components/Overview/TilesList";
import { useAppSelector } from "../redux/store";
import { Appbar, Button, IconButton } from "react-native-paper";
import useTranslation from "../service/useTranslation";
import { Movie } from "../../types";
import { useState } from "react";
import Modal from "./Overview/Modal";

export default function Group({ navigation, route }: any) {
  const { group } = route.params;

  const groups = useAppSelector((st) => st.favourite.groups);

  const data = groups.find((g) => g.id === group.id);

  const t = useTranslation();

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  return (
    <View style={{ flex: 1, paddingBottom: 15 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} />

        <Text style={{ fontFamily: "Bebas", fontSize: 40, textAlign: "center", width: "70%", color: "#fff" }}>{data?.name}</Text>
      </View>
      <View style={{ flex: 1, padding: 15 }}>
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
      {match && (
        <Modal
          styles={{ paddingTop: Platform.OS === "ios" ? 50 : 0 }}
          onClose={() => setMatch(undefined)}
          match={{
            ...match,
            poster_path: match.imageUrl,
          }}
        />
      )}

      <View style={{ paddingHorizontal: 15, paddingBottom: 15 }}>
        <Button
          mode="contained"
          style={{ borderRadius: 100 }}
          contentStyle={{ padding: 7.5 }}
          onPress={() => {
            if (match) return setMatch(undefined);
            setMatch(data?.movies?.[Math.floor(Math.random() * data?.movies.length)]);
          }}
        >
          {match ? t("likes.close") : t("likes.random")}
        </Button>
      </View>
    </View>
  );
}
