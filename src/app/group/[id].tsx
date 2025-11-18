import { useEffect, useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import TilesList from "../../components/Overview/TilesList";
import PageHeading from "../../components/PageHeading";
import { removeFromGroup } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useIsPreview, useLocalSearchParams } from "expo-router";
import Modal from "../../screens/Overview/Modal";

export default function Group() {
  const params = useLocalSearchParams();

  const groups = useAppSelector((st) => st.favourite.groups);
  const dispatch = useAppDispatch();

  const isPreview = useIsPreview();

  const data = useMemo(() => groups.find((g) => g.id === params.id), [groups, params.id, isPreview]);

  const insets = useSafeAreaInsets();

  const [match, setMatch] = useState<(typeof groups)[number]["movies"][number] | undefined>(undefined);

  console.log("RENDER GROUP", data?.movies.length);

  return (
    <SafeIOSContainer style={{ flex: 1, overflow: "hidden" }}>
      {!isPreview && <PageHeading title={data?.name! || ""} styles={Platform.OS === "android" && { marginTop: insets.top + 30 }} />}

      <View style={{ flex: 1, paddingHorizontal: 15, marginTop: Platform.OS === "android" ? 30 : 0 }}>
        <TilesList
          contentContainerStyle={{ paddingTop: 80, flex: 1 }}
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
