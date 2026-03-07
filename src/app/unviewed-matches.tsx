import { memo, useCallback, useEffect, useState } from "react";
import { Dimensions, FlatList, Platform, Pressable, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { router } from "expo-router";
import { useMatches } from "../context/DatabaseContext";
import Thumbnail from "../components/Thumbnail";
import useTranslation from "../service/useTranslation";
import type { StoredMatch } from "../database/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 20;
const GRID_WIDTH = SCREEN_WIDTH - GRID_PADDING * 2;
const ITEM_WIDTH = GRID_WIDTH / 3;

const getItemLayout = (_: any, index: number) => ({
  length: ITEM_WIDTH * 1.5,
  offset: (ITEM_WIDTH * 1.5 + GRID_PADDING) * index,
  index,
});

function UnviewedMatchesScreen() {
  const { matches: matchesRepo, isReady } = useMatches();
  const [unviewedMatches, setUnviewedMatches] = useState<StoredMatch[]>([]);
  const t = useTranslation();

  useEffect(() => {
    if (isReady && matchesRepo) {
      matchesRepo.getUnviewed().then((matches) => {
        if (matches.length === 0) {
          router.back();
        } else {
          setUnviewedMatches(matches);
          matchesRepo.markAllViewed();
        }
      });
    }
  }, [isReady, matchesRepo]);

  const handleViewMatch = useCallback((match: StoredMatch) => {
    router.replace({
      pathname: "/movie/type/[type]/[id]",
      params: {
        id: match.movie_id,
        type: match.movie_type,
        img: match.poster_path,
      },
    });
  }, []);

  const handleDismiss = useCallback(() => {
    router.back();
  }, []);

  const renderMatch = useCallback(
    ({ item }: { item: StoredMatch }) => (
      <Pressable onPress={() => handleViewMatch(item)} style={styles.matchItem}>
        <Thumbnail path={item.poster_path || ""} size={200} container={styles.thumbnailContainer} style={styles.thumbnail} />
      </Pressable>
    ),
    [handleViewMatch],
  );

  if (unviewedMatches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <IconButton icon="close" size={24} onPress={handleDismiss} style={styles.closeButton} iconColor="#fff" />

      <Text style={styles.title}>{t("matches.unviewed-title")}</Text>
      <Text style={styles.subtitle}>{t("matches.unviewed-subtitle", { count: unviewedMatches.length })}</Text>

      <View style={[styles.gridWrapper, { height: ITEM_WIDTH * 1.5 * 3.5 }]}>
        <FlatList
          getItemLayout={getItemLayout}
          data={unviewedMatches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
        />
      </View>

      <View style={styles.actions}>
        <Button mode="contained" onPress={handleDismiss} style={styles.button} contentStyle={styles.buttonContent}>
          {t("matches.start-new-game")}
        </Button>
      </View>
    </View>
  );
}

export default memo(UnviewedMatchesScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === "android" ? "#000" : "transparent",
    padding: GRID_PADDING,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "left",
    marginBottom: 20,
  },
  gridWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    width: GRID_WIDTH,
  },
  matchItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
  },
  thumbnailContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
  },
  thumbnail: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
  },
  actions: {
    marginTop: 20,
  },
  button: {
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 7.5,
  },
});
