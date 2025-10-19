import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MoviesActionButtons from "../components/MoviesActionButtons";
import TilesList from "../components/Overview/TilesList";
import PageHeading from "../components/PageHeading";
import { removeFromGroup } from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import Modal from "./Overview/Modal";
import { ScreenProps } from "./types";
import SafeIOSContainer from "../components/SafeIOSContainer";

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

  return (
    <SafeIOSContainer style={{ flex: 1, overflow: "hidden" }}>
      <PageHeading title={data?.name! || ""} />
      <View style={{ flex: 1, paddingHorizontal: 15 }}>
        <TilesList
          contentContainerStyle={{ paddingTop: 80 }}
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

      <MoviesActionButtons
        match={!!match}
        fortuneWheelMovies={
          data?.movies.map((m) => ({
            ...m,
            poster_path: m.imageUrl,
          })) || []
        }
        fortuneWheelTitle={data?.name || ""}
        onScratchCardPress={() => {
          if (match) return setMatch(undefined);
          setMatch(data?.movies?.[Math.floor(Math.random() * data?.movies.length)]);
        }}
        containerStyle={{ bottom: 30 }}
      />
    </SafeIOSContainer>
  );
}
