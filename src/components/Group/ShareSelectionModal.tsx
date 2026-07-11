import { useCallback } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";
import { FancySpinner } from "../FancySpinner";
import MarathonTicket from "../MarathonTicket";
import PlatformBlurView from "../PlatformBlurView";
import useTranslation from "../../service/useTranslation";
import ShareThumbnailItem from "./ShareThumbnailItem";
import {
  useShareSelection,
  MAX_SELECTION,
  ShareMovie,
} from "../../hooks/useShareSelection";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface ShareSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  movies: ShareMovie[];
}

export default function ShareSelectionModal({
  visible,
  onClose,
  movies,
}: ShareSelectionModalProps) {
  const t = useTranslation();
  const {
    viewShotRef,
    selectedIds,
    toggleSelection,
    handleShare,
    isLoading,
    isSharing,
    error,
    data,
  } = useShareSelection(movies, visible);

  const renderItem = useCallback(
    ({ item }: { item: ShareMovie }) => (
      <ShareThumbnailItem
        imageUrl={item.imageUrl}
        isSelected={selectedIds.has(item.id)}
        isDisabled={
          !selectedIds.has(item.id) && selectedIds.size >= MAX_SELECTION
        }
        onPress={() => toggleSelection(item.id)}
      />
    ),
    [selectedIds, toggleSelection],
  );

  if (isSharing && data?.movies?.length) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <View style={styles.ticketContent}>
            <IconButton
              icon="close"
              size={24}
              onPress={onClose}
              style={styles.ticketCloseButton}
              iconColor="#000"
            />
            <ViewShot
              ref={viewShotRef}
              options={{
                format: "png",
                quality: 1,
                fileName: "collection-share.png",
              }}
              style={styles.viewShot}
            >
              <MarathonTicket movies={data.movies} />
            </ViewShot>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <PlatformBlurView style={styles.content}>
          <View style={styles.inner}>
            <IconButton
              icon="close"
              size={24}
              onPress={onClose}
              style={styles.closeButton}
              iconColor="#fff"
            />
            {isLoading || isSharing ? (
              <View style={styles.centeredBox}>
                <FancySpinner size={60} />
                <Text style={styles.loadingText}>
                  {t("favourites.share.loading")}
                </Text>
              </View>
            ) : error ? (
              <View style={styles.centeredBox}>
                <MaterialCommunityIcons
                  name="share-off"
                  size={48}
                  color="#ff6b6b"
                />
                <Text style={styles.errorText}>
                  {t("favourites.share.error")}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.title}>{t("favourites.share.title")}</Text>
                <Text style={styles.subtitle}>
                  {(t("favourites.share.selected") as string)
                    .replace("{count}", String(selectedIds.size))
                    .replace("{max}", String(MAX_SELECTION))}
                </Text>
                <FlatList
                  data={movies}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={3}
                  contentContainerStyle={styles.listContent}
                  columnWrapperStyle={styles.columnWrapper}
                  showsVerticalScrollIndicator={false}
                  style={styles.list}
                />
                <Button
                  mode="contained"
                  onPress={handleShare}
                  disabled={selectedIds.size === 0}
                  style={styles.shareButton}
                  contentStyle={styles.shareButtonContent}
                  icon="share-variant"
                >
                  {(t("favourites.share.button") as string).replace(
                    "{count}",
                    String(selectedIds.size),
                  )}
                </Button>
              </>
            )}
          </View>
        </PlatformBlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.85)" },
  ticketContent: { alignItems: "center", maxHeight: SCREEN_HEIGHT * 0.9 },
  ticketCloseButton: {
    position: "absolute",
    top: 25,
    right: 25,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  viewShot: { backgroundColor: "#000", borderRadius: 16 },
  content: {
    width: SCREEN_WIDTH - 30,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderRadius: 35,
    overflow: "hidden",
    ...Platform.select({
      android: {
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
      },
    }),
  },
  inner: { padding: 30, alignItems: "center" },
  closeButton: { position: "absolute", top: 0, right: 0, zIndex: 10 },
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
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginBottom: 20,
  },
  list: { maxHeight: SCREEN_HEIGHT * 0.45, width: "100%" },
  listContent: { paddingBottom: 10 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 10 },
  shareButton: { marginTop: 20, borderRadius: 100, width: "100%" },
  shareButtonContent: { paddingVertical: 10, paddingHorizontal: 20 },
  centeredBox: { alignItems: "center", justifyContent: "center", padding: 40 },
  loadingText: {
    marginTop: 16,
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 16,
    letterSpacing: 1,
  },
  errorText: {
    marginTop: 12,
    color: "#999",
    fontFamily: "Bebas",
    fontSize: 16,
    letterSpacing: 1,
  },
});
