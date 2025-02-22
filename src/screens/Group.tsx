import { Platform, Text, View } from "react-native";
import TilesList from "../components/Overview/TilesList";
import { useAppSelector } from "../redux/store";
import { Appbar, Button, IconButton } from "react-native-paper";
import useTranslation from "../service/useTranslation";
import { Movie } from "../../types";
import { useState } from "react";
import Modal from "./Overview/Modal";
import PageHeading from "../components/PageHeading";

export default function Group({ navigation, route }: any) {
  const { group } = route.params;

  const groups = useAppSelector((st) => st.favourite.groups);

  const data = groups.find((g) => g.id === group.id);

  const t = useTranslation();

  const [match, setMatch] = useState<Movie | undefined>(undefined);

  return (
    <View style={{ flex: 1, paddingBottom: 15, paddingVertical: 15 }}>
      <PageHeading title={data?.name! || ""} />
      <View style={{ flex: 1, paddingHorizontal: 15 }}>
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
