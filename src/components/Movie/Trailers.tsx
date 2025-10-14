import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, AppState, Dimensions, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { MD2DarkTheme, Text, IconButton } from "react-native-paper";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeOut,
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useGetTrailersQuery } from "../../redux/movie/movieApi";
import { hexToRgba } from "../../utils/hexToRgb";
import PlatformBlurView, { BlurViewWrapper } from "../PlatformBlurView";
import { Entypo } from "@expo/vector-icons";
import YoutubeIframe from "react-native-youtube-iframe";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const config = {
  damping: 20,
  stiffness: 200,
  mass: 0.9,
};

export default function Trailers({
  id,
  type,
  isOpen,
  handleClose: handleCloseModal,
  handleOpen,
}: {
  id: number;
  type: string;
  isOpen?: boolean;
  handleClose(): void;
  handleOpen(): void;
}) {
  const { data: trailers } = useGetTrailersQuery({ id, type });
  const isExpanded = useSharedValue(false);
  const insets = useSafeAreaInsets();

  const filteredItems = useMemo(() => {
    return trailers?.filter((v) => v.site === "YouTube" && v.official).slice(0, 3) || [];
  }, [trailers]);

  const animatedValue = useAnimatedStyle(() => ({
    width: withSpring(isExpanded.value ? width - 30 : 115, config),
    height: withSpring(isExpanded.value ? height - insets.top - 100 : 45, config),
  }));

  const [canPlay, setCanPlay] = useState(false);

  const handleClose = () => {
    isExpanded.value = false;

    setTimeout(() => {
      handleCloseModal();
    }, 300);
  };

  useEffect(() => {
    if (!isOpen) {
      setCanPlay(false);
      isExpanded.value = false;
      handleCloseModal();
    }
  }, [isOpen]);

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

  if (!filteredItems.length) return null;

  return (
    <>
      <Animated.View style={styles.container}>
        <PlatformBlurView
          style={[
            styles.blurContainer,
            Platform.OS === "android" && { backgroundColor: "#000", borderWidth: 1, borderColor: hexToRgba("#FFFFFF", 0.1) },
          ]}
        >
          <Animated.View style={[animatedValue, styles.content]}>
            {isOpen && (
              <>
                <Animated.View entering={FadeInDown.delay(100)} style={styles.videosContainer}>
                  <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 70 }]}
                    showsVerticalScrollIndicator={false}
                  >
                    {filteredItems.map((trailer, index) => (
                      <PlayerItem key={trailer.id} canPlay={canPlay} index={index} name={trailer.name} videoKey={trailer.key} />
                    ))}
                  </ScrollView>
                </Animated.View>
              </>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (!isOpen) {
                  isExpanded.value = true;
                  handleOpen();
                } else {
                  handleClose();
                }
              }}
              style={[
                styles.buttonsContainer,
                {
                  width: isOpen ? width - 60 : 90,
                },
              ]}
            >
              {!isOpen && (
                <Animated.View entering={FadeInLeft} exiting={FadeOutLeft}>
                  <Entypo name="youtube" size={24} color="#FF0000" />
                </Animated.View>
              )}
              <Text variant="bodyMedium" style={styles.buttonText} numberOfLines={1}>
                {isOpen ? "" : "Trailers"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </PlatformBlurView>
      </Animated.View>

      {isOpen && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="auto">
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
      )}
    </>
  );
}

const PlayerItem = ({ name, videoKey, index, canPlay }: { name: string; videoKey: string; index: number; canPlay?: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80)} style={styles.playerItem}>
      <BlurViewWrapper style={{ borderRadius: 15 }}>
        <Pressable onPress={() => setIsPlaying((p) => !p)} style={styles.playerWrapper}>
          {!isReady && (
            <View style={styles.placeholder}>
              <ActivityIndicator size="large" color={MD2DarkTheme.colors.primary} />
              <Text variant="bodySmall" style={styles.loadingText}>
                Loading...
              </Text>
            </View>
          )}
          <YoutubeIframe
            play={isPlaying && canPlay}
            width={width - 60}
            height={(width - 60) * 0.5625}
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
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  },
  container: {
    position: "absolute",
    right: 0,
    bottom: 15,
    zIndex: 1000,
  },
  blurContainer: {
    borderRadius: 15,
    marginRight: 15,
    overflow: "hidden",
  },
  content: {
    position: "relative",
    overflow: "hidden",
  },
  closeButtonContainer: {
    position: "absolute",
    left: 15,
    zIndex: 10,
  },
  closeButtonBlur: {
    borderRadius: 12,
    overflow: "hidden",
  },
  videosContainer: {
    flex: 1,
    paddingTop: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    gap: 20,
  },
  playerItem: {
    gap: 10,
  },
  videoTitle: {
    color: "white",
    fontWeight: "600",
    padding: 10,
  },
  playerWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: hexToRgba("#000", 0.2),
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
    backgroundColor: hexToRgba("#000", 0.8),
    zIndex: 1,
    gap: 10,
  },
  loadingText: {
    color: hexToRgba("#FFF", 0.7),
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "absolute",
    bottom: 10,
    left: 15,
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
