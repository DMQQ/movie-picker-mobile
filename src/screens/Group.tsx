import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../types";
import TilesList from "../components/Overview/TilesList";
import PageHeading from "../components/PageHeading";
import { removeFromGroup } from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import fillMissing from "../utils/fillMissing";
import { shuffleInPlace } from "../utils/shuffle";
import Modal from "./Overview/Modal";
import { ScreenProps } from "./types";

export default function Group({ navigation, route }: ScreenProps<"Group">) {
  const { group } = route.params;

  const groups = useAppSelector((st) => st.favourite.groups);
  const dispatch = useAppDispatch();

  const data = groups.find((g) => g.id === group.id);

  const t = useTranslation();

  const insets = useSafeAreaInsets();

  const [match, setMatch] = useState<(typeof groups)[number]["movies"][number] | undefined>(undefined);

  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    navigation.addListener("blur", () => {
      setShowWheel(false);
    });
  }, []);

  const onSelectedItem = useCallback((item: Movie) => {
    const type = item?.type === "tv" ? "tv" : "movie";
    setShowWheel(false);
    navigation.navigate("MovieDetails", {
      id: item.id,
      img: item.poster_path,
      type: type,
    });
  }, []);

  const items = useMemo(() => {
    return fillMissing(
      shuffleInPlace(
        data?.movies.map((m) => ({
          ...m,
          image: m.imageUrl,
          poster_path: m.imageUrl,
        })) || []
      ),
      12
    );
  }, [data?.movies]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, overflow: "hidden" }}>
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
          onLongItemPress={(item) => {
            dispatch(removeFromGroup({ groupId: data?.id!, movieId: item.id }));
          }}
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
          {match ? t("likes.close") : t("favourites.scratch-card")}
        </Button>

        {/* <Button
          style={{ borderRadius: 100, flex: 1 }}
          contentStyle={{ padding: 7.5 }}
          icon={"dice-5"}
          mode="contained"
          onPress={() => setShowWheel((p) => !p)}
          buttonColor={MD2DarkTheme.colors.accent}
        >
          {t("favourites.wheel")}
        </Button> */}
      </View>
      {/* {showWheel && <FortuneWheelComponent items={items} size={Dimensions.get("screen").width * 1.75} onSelectedItem={onSelectedItem} />} */}
    </View>
  );
}
