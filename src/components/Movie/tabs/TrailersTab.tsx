import { memo, useEffect, useMemo, useState } from "react";
import Text from "../../Text";
import { ActivityIndicator, AppState, Dimensions, Pressable, StyleSheet, View } from "react-native";

import { colors, fontWeight, fontSize, radius, spacing } from "../../../constants/design";
import Animated, { FadeInDown } from "react-native-reanimated";
import { hexToRgba } from "../../../utils/hexToRgb";
import { BlurViewWrapper } from "../../PlatformBlurView";
import YoutubeIframe from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

interface TrailersTabProps {
  initialData?: any[];
}

function TrailersTab({ initialData }: TrailersTabProps) {
  const [canPlay, setCanPlay] = useState(false);

  const filteredItems = useMemo(() => {
    return initialData?.filter((v) => v.site === "YouTube").slice(0, 5) || [];
  }, [initialData]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setCanPlay(true);
      } else {
        setCanPlay(false);
      }
    });

    return () => sub.remove();
  }, []);

  if (!filteredItems.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No trailers available</Text>
      </View>
    );
  }

  return (
    <View style={styles.scrollContent}>
      {filteredItems.map((item, index) => (
        <View key={item.id}>
          <PlayerItem canPlay={canPlay} index={index} name={item.name} videoKey={item.key} />
          {index < filteredItems.length - 1 && <View style={{ height: 20 }} />}
        </View>
      ))}
    </View>
  );
}

export default memo(TrailersTab);

const PlayerItem = memo(({ name, videoKey, index, canPlay }: { name: string; videoKey: string; index: number; canPlay?: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80)} style={styles.playerItem}>
      <BlurViewWrapper style={{ borderRadius: radius.md + 3 }}>
        <Pressable onPress={() => setIsPlaying((p) => !p)} style={styles.playerWrapper}>
          {!isReady && (
            <View style={styles.placeholder}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="bodySmall" style={styles.loadingText}>
                Loading...
              </Text>
            </View>
          )}
          <YoutubeIframe
            play={isPlaying && canPlay}
            width={width - 30}
            height={(width - 30) * 0.5625}
            videoId={videoKey}
            onReady={() => setIsReady(true)}
          />
        </Pressable>
        <Text variant="titleSmall" style={styles.videoTitle} numberOfLines={2}>
          {name}
        </Text>
      </BlurViewWrapper>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.screen,
  },
  playerItem: {
    gap: spacing.sm + 2,
  },
  videoTitle: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
    padding: spacing.sm + 2,
  },
  playerWrapper: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: hexToRgba(colors.appBackground, 0.2),
    position: "relative",
  },
  placeholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: hexToRgba(colors.appBackground, 0.8),
    zIndex: 1,
    gap: spacing.sm + 2,
  },
  loadingText: {
    color: hexToRgba(colors.text, 0.7),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: fontSize.lg,
  },
});
