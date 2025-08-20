import { useState } from "react";
import { Platform, View } from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TilesList from "../components/Overview/TilesList";
import PageHeading from "../components/PageHeading";
import { useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import Modal from "./Overview/Modal";

export default function Group({ navigation, route }: any) {
  const { group } = route.params;

  const groups = useAppSelector((st) => st.favourite.groups);

  const data = groups.find((g) => g.id === group.id);

  const t = useTranslation();

  const insets = useSafeAreaInsets();

  const [match, setMatch] = useState<(typeof groups)[number]["movies"][number] | undefined>(undefined);

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
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

      <View style={{ paddingHorizontal: 15, paddingTop: 15, flexDirection: "row", gap: 15 }}>
        <Button
          mode="contained"
          style={{ borderRadius: 100, flex: 1 }}
          contentStyle={{ padding: 7.5 }}
          onPress={() => {
            if (match) return setMatch(undefined);
            setMatch(data?.movies?.[Math.floor(Math.random() * data?.movies.length)]);
          }}
        >
          {match ? t("likes.close") : t("likes.random")}
        </Button>

        {/* <IconButton icon={"dice-5"} mode="contained" /> */}
      </View>
      {/* 
      <FortuneWheelComponent
        items={
          data?.movies.map((m) => ({
            ...m,
            image: m.imageUrl,
            poster_path: m.imageUrl,
          })) || []
        }
        size={Dimensions.get("screen").width * 1.75}
      /> */}
    </View>
  );
}
