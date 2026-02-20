import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Dimensions, FlatList, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MoviesActionButtons from "../../components/MoviesActionButtons";
import TilesList from "../../components/Overview/TilesList";
import PageHeading from "../../components/PageHeading";
import { removeFromGroup } from "../../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useIsPreview, useLocalSearchParams } from "expo-router";
import OverviewModal from "../../screens/Overview/Modal";
import { Button, Checkbox, IconButton, Text } from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { FancySpinner } from "../../components/FancySpinner";
import MarathonTicket from "../../components/MarathonTicket";
import Thumbnail from "../../components/Thumbnail";
import { useShareMoviesMutation } from "../../redux/movie/movieApi";
import PlatformBlurView from "../../components/PlatformBlurView";
import useTranslation from "../../service/useTranslation";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_SELECTION = 7;

interface ShareSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  movies: Array<{ id: number; imageUrl: string; type: "movie" | "tv" }>;
}

const ShareSelectionModal = memo(({ visible, onClose, movies }: ShareSelectionModalProps) => {
  const viewShotRef = useRef<ViewShot>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [shareMovies, { data, isLoading, error, reset }] = useShareMoviesMutation();
  const [isSharing, setIsSharing] = useState(false);
  const prevVisibleRef = useRef(false);
  const t = useTranslation();

  useEffect(() => {
    // Only reset when modal opens (visible changes from false to true)
    if (visible && !prevVisibleRef.current && movies.length > 0) {
      const initialSelection = new Set(movies.slice(0, Math.min(MAX_SELECTION, movies.length)).map((m) => m.id));
      setSelectedIds(initialSelection);
      reset();
      setIsSharing(false);
    }
    prevVisibleRef.current = visible;
  }, [visible, movies, reset]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SELECTION) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleShare = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const selectedMovies = movies.filter((m) => selectedIds.has(m.id)).map((m) => ({ id: m.id, type: m.type }));

    setIsSharing(true);
    await shareMovies({ movies: selectedMovies });
  }, [selectedIds, movies, shareMovies]);

  const captureAndShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        fileName: `collection-share.png`,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: t("favourites.share.dialog-title") as string,
        });
      }
    } catch (err) {
      console.error("Failed to capture ticket:", err);
    }
  }, []);

  useEffect(() => {
    if (!data || !isSharing) return;

    let timeout = setTimeout(() => {
      captureAndShare();
    }, 500);

    return () => clearTimeout(timeout);
  }, [data, isSharing, captureAndShare]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof movies)[number] }) => {
      const isSelected = selectedIds.has(item.id);
      const isDisabled = !isSelected && selectedIds.size >= MAX_SELECTION;

      return (
        <Pressable
          onPress={() => toggleSelection(item.id)}
          style={[shareStyles.thumbnailContainer, isDisabled && shareStyles.thumbnailDisabled]}
        >
          <Thumbnail
            size={185}
            path={item.imageUrl}
            container={{ width: "100%", height: "100%", borderRadius: 8 }}
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          />
          <View style={[shareStyles.checkboxOverlay, isSelected && shareStyles.checkboxOverlaySelected]}>
            <Checkbox status={isSelected ? "checked" : "unchecked"} color="#fff" uncheckedColor="rgba(255,255,255,0.7)" />
          </View>
        </Pressable>
      );
    },
    [selectedIds, toggleSelection],
  );

  const showTicketPreview = isSharing && data?.movies && data.movies.length > 0;

  if (showTicketPreview) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <View style={shareStyles.modalOverlay}>
          <Pressable style={shareStyles.modalBackdrop} onPress={onClose} />
          <View style={shareStyles.ticketContent}>
            <IconButton icon="close" size={24} onPress={onClose} style={shareStyles.ticketCloseButton} iconColor="#000" />
            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 1, fileName: `collection-share.png` }}
              style={shareStyles.viewShot}
            >
              <MarathonTicket movies={data.movies} />
            </ViewShot>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={shareStyles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <PlatformBlurView style={shareStyles.modalContent}>
          <View style={shareStyles.modalInner}>
            <IconButton icon="close" size={24} onPress={onClose} style={shareStyles.closeButton} iconColor="#fff" />

            {isLoading || isSharing ? (
              <View style={shareStyles.loadingContainer}>
                <FancySpinner size={60} />
                <Text style={shareStyles.loadingText}>{t("favourites.share.loading")}</Text>
              </View>
            ) : error ? (
              <View style={shareStyles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
                <Text style={shareStyles.errorText}>{t("favourites.share.error")}</Text>
              </View>
            ) : (
              <>
                <Text style={shareStyles.title}>{t("favourites.share.title")}</Text>
                <Text style={shareStyles.subtitle}>
                  {(t("favourites.share.selected") as string).replace("{count}", String(selectedIds.size)).replace("{max}", String(MAX_SELECTION))}
                </Text>

                <FlatList
                  data={movies}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={3}
                  contentContainerStyle={shareStyles.listContent}
                  columnWrapperStyle={shareStyles.columnWrapper}
                  showsVerticalScrollIndicator={false}
                  style={shareStyles.list}
                />

                <Button
                  mode="contained"
                  onPress={handleShare}
                  disabled={selectedIds.size === 0}
                  style={shareStyles.shareButton}
                  contentStyle={shareStyles.shareButtonContent}
                  icon="share-variant"
                >
                  {(t("favourites.share.button") as string).replace("{count}", String(selectedIds.size))}
                </Button>
              </>
            )}
          </View>
        </PlatformBlurView>
      </View>
    </Modal>
  );
});

const shareStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  ticketContent: {
    alignItems: "center",
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  ticketCloseButton: {
    position: "absolute",
    top: 25,
    right: 25,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modalContent: {
    width: SCREEN_WIDTH - 30,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderRadius: 35,
    overflow: "hidden",
    ...Platform.select({
      android: {
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.18)",
      },
    }),
  },
  modalInner: {
    padding: 30,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
    marginBottom: 20,
  },
  list: {
    maxHeight: SCREEN_HEIGHT * 0.45,
    width: "100%",
  },
  listContent: {
    paddingBottom: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  thumbnailContainer: {
    width: (SCREEN_WIDTH - 90) / 3,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailDisabled: {
    opacity: 0.4,
  },
  checkboxOverlay: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 100,
  },
  checkboxOverlaySelected: {
    backgroundColor: "rgba(103, 80, 164, 0.8)",
  },
  shareButton: {
    marginTop: 20,
    borderRadius: 100,
    width: "100%",
  },
  shareButtonContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  viewShot: {
    backgroundColor: "#000",
    borderRadius: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 16,
    letterSpacing: 1,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    marginTop: 12,
    color: "#999",
    fontFamily: "Bebas",
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default function Group() {
  const params = useLocalSearchParams();

  const groups = useAppSelector((st) => st.favourite.groups);
  const dispatch = useAppDispatch();

  const isPreview = useIsPreview();

  const data = useMemo(() => groups.find((g) => g.id === params.id), [groups, params.id, isPreview]);

  const insets = useSafeAreaInsets();

  const [match, setMatch] = useState<(typeof groups)[number]["movies"][number] | undefined>(undefined);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  return (
    <SafeIOSContainer style={{ flex: 1, overflow: "hidden" }}>
      {!isPreview && (
        <PageHeading
          title={data?.name! || ""}
          styles={Platform.OS === "android" && { marginTop: insets.top }}
          showRightIconButton={(data?.movies?.length || 0) > 0}
          rightIconName="share-outline"
          onRightIconPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShareModalVisible(true);
          }}
        />
      )}

      <View style={{ flex: 1, paddingHorizontal: 15, marginTop: Platform.OS === "android" ? 30 : 0 }}>
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
        <OverviewModal
          styles={{ paddingTop: Platform.OS === "ios" ? 50 : 0 }}
          onClose={() => setMatch(undefined)}
          match={{
            ...match,
            poster_path: match.imageUrl,
          }}
        />
      )}

      <ShareSelectionModal visible={shareModalVisible} onClose={() => setShareModalVisible(false)} movies={data?.movies || []} />

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
