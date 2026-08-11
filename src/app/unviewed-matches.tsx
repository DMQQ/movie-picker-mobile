import { memo, useCallback, useEffect, useMemo, useState } from "react";
import IconButton from "../components/IconButton";
import Text from "../components/Text";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { colors, fontSize, radius, spacing } from "../constants/design";
import PrimaryButton from "../components/PrimaryButton";
import { router } from "expo-router";
import { useMatches } from "../context/DatabaseContext";
import Thumbnail, { ThumbnailSizes } from "../components/Thumbnail";
import useTranslation from "../service/useTranslation";
import type { StoredMatch } from "../database/types";
import CreateCollectionFromLiked from "../components/CreateCollectionFromLiked";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 20;
const GRID_WIDTH = SCREEN_WIDTH - GRID_PADDING * 2;

const getGridConfig = (count: number) => {
  if (count <= 2) {
    return { numColumns: 2, thumbnailSize: ThumbnailSizes.poster.xlarge };
  }
  if (count < 6) {
    return { numColumns: 3, thumbnailSize: ThumbnailSizes.poster.large };
  }
  return { numColumns: 3, thumbnailSize: ThumbnailSizes.poster.medium };
};

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
  const handlePlay = useCallback(() => {
    router.back();
    router.navigate({
      pathname: "/room/qr-code",
      params: { quickStart: true },
    });
  }, []);
  const gridConfig = useMemo(
    () => getGridConfig(unviewedMatches.length),
    [unviewedMatches.length],
  );
  const itemWidth = GRID_WIDTH / gridConfig.numColumns;
  const itemHeight = itemWidth * 1.5;
  const gridHeight = itemHeight * 2.25;

  const renderMatch = useCallback(
    ({ item }: { item: StoredMatch }) => (
      <Pressable
        onPress={() => handleViewMatch(item)}
        style={{ width: itemWidth, height: itemHeight }}
      >
        <Thumbnail
          path={item.poster_path || ""}
          size={gridConfig.thumbnailSize}
          container={{ width: itemWidth, height: itemHeight }}
          style={{ width: itemWidth, height: itemHeight }}
        />
      </Pressable>
    ),
    [handleViewMatch, itemWidth, itemHeight, gridConfig.thumbnailSize],
  );

  const insets = useSafeAreaInsets();

  if (unviewedMatches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <IconButton
        icon="close"
        size={24}
        onPress={handleDismiss}
        style={styles.closeButton}
        iconColor={colors.text}
      />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{t("matches.unviewed-title")}</Text>
          <Text style={styles.subtitle}>
            {t("matches.unviewed-subtitle", { count: unviewedMatches.length })}
          </Text>
        </View>
      </View>

      <View style={[styles.gridWrapper, { height: gridHeight }]}>
        <FlatList
          key={gridConfig.numColumns}
          getItemLayout={(_, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
          })}
          data={unviewedMatches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id.toString()}
          numColumns={gridConfig.numColumns}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View style={[styles.actions, { paddingBottom: insets.bottom + (Platform.OS === "android" ? 30 : 15) }]}>
        <PrimaryButton onPress={handlePlay} style={styles.button}>
          {t("matches.start-new-game")}
        </PrimaryButton>
        <CreateCollectionFromLiked
          data={unviewedMatches.map((m) => ({
            id: m.movie_id,
            poster_path: m.poster_path,
            title: m.title,
            type: m.movie_type,
          }))}
          beforeCreate={() => router.back()}
        />
      </View>
    </View>
  );
}

export default memo(UnviewedMatchesScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      Platform.OS === "android" ? colors.surface : "transparent",
    padding: GRID_PADDING,
    paddingBottom: spacing.screen,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: colors.text,
    textAlign: "left",
  },
  subtitle: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.7)",
    textAlign: "left",
  },
  gridWrapper: {
    borderRadius: radius.sm,
    overflow: "hidden",
    width: GRID_WIDTH,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: GRID_PADDING,
  },
  button: {
    borderRadius: radius.lg + 1,
    flex: 1,
  },
  buttonContent: {
    paddingVertical: spacing.xs + 3.5,
  },
});
