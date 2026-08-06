import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { colors } from "../../constants/design";
import { useIsPreview, router } from "expo-router";
import * as Haptics from "expo-haptics";
import GroupScreenLayout from "../../components/Group/GroupScreenLayout";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import OverviewModal from "../../screens/Overview/Modal";
import ShareSelectionModal from "../../components/Group/ShareSelectionModal";
import RateButton from "../../components/Group/RateButton";
import { useGroupData, GroupMovie } from "../../hooks/useGroupData";

export default function Group() {
  const { data, isListLoading, isRemote, handleRemoveItem, itemIdMap, listType } = useGroupData();
  const isPreview = useIsPreview();

  const [match, setMatch] = useState<GroupMovie | undefined>(undefined);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const movies = data?.movies ?? [];
  const fortuneMovies = movies.map((m) => ({ ...m, poster_path: m.imageUrl }));

  const openRateSheet = (item: GroupMovie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/group/rate-movie",
      params: {
        movieId: String(item.id),
        groupId: data?.id ?? "",
        remoteItemId: itemIdMap.get(item.id) ?? "",
        listType: listType ?? "",
        rating: item.rating != null ? String(item.rating) : "",
        note: item.note ?? "",
      },
    });
  };

  return (
    <GroupScreenLayout
      title={data?.name ?? ""}
      data={fortuneMovies}
      isLoading={isRemote && isListLoading}
      showHeading={!isPreview}
      showRightIconButton={movies.length > 0}
      rightIconName="share-outline"
      onRightIconPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShareModalVisible(true);
      }}
      renderItemFooter={(item) => (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <IconButton
              icon="trash-can-outline"
              iconColor={colors.error}
              size={18}
              onPress={() => handleRemoveItem(item.id)}
              style={styles.trashButton}
            />
            <RateButton
              rating={item.rating}
              onPress={() => openRateSheet(item)}
            />
          </View>
          {!!item.note && (
            <Text style={styles.note} numberOfLines={1}>{item.note}</Text>
          )}
        </View>
      )}
    >
      {match && (
        <OverviewModal
          styles={{ paddingTop: 50 }}
          onClose={() => setMatch(undefined)}
          match={{ ...match, poster_path: match.imageUrl }}
        />
      )}
      <ShareSelectionModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        movies={movies}
      />
      <MoviesActionButtons
        match={!!match}
        fortuneWheelMovies={fortuneMovies}
        fortuneWheelTitle={data?.name ?? ""}
        onScratchCardPress={() => {
          if (match) return setMatch(undefined);
          setMatch(movies[Math.floor(Math.random() * movies.length)]);
        }}
        containerStyle={{ bottom: 30 }}
      />
    </GroupScreenLayout>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trashButton: {
    margin: 0,
  },
  note: {
    fontSize: fontSize.xs,
    color: "#888",
    marginTop: 4,
    marginLeft: 2,
  },
});
