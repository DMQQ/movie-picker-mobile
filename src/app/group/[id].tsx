import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, MD2DarkTheme } from "react-native-paper";
import { useIsPreview } from "expo-router";
import * as Haptics from "expo-haptics";
import GroupScreenLayout from "../../components/Group/GroupScreenLayout";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import OverviewModal from "../../screens/Overview/Modal";
import ShareSelectionModal from "../../components/Group/ShareSelectionModal";
import { useGroupData, GroupMovie } from "../../hooks/useGroupData";

export default function Group() {
  const { data, isListLoading, isRemote, handleRemoveItem } = useGroupData();
  const isPreview = useIsPreview();

  const [match, setMatch] = useState<GroupMovie | undefined>(undefined);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const movies = data?.movies ?? [];
  const fortuneMovies = movies.map((m) => ({ ...m, poster_path: m.imageUrl }));

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
          <Button
            mode="outlined"
            onPress={() => handleRemoveItem(item.id)}
            style={styles.removeButton}
            textColor={MD2DarkTheme.colors.error}
            compact
          >
            Remove
          </Button>
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
  footer: { flex: 1, justifyContent: "space-between", marginTop: 5 },
  removeButton: { marginTop: 8, borderColor: MD2DarkTheme.colors.error },
});
