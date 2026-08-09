import { useCallback } from "react";
import IconButton from "../IconButton";
import Text from "../Text";
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import PrimaryButton from "../PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";
import { FancySpinner } from "../FancySpinner";
import MarathonTicket from "../MarathonTicket";
import PlatformBlurView from "../PlatformBlurView";
import useTranslation from "../../service/useTranslation";
import ShareThumbnailItem from "./ShareThumbnailItem";
import { colors, fontSize, radius, spacing} from "../../constants/design";
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
              iconColor={colors.appBackground}
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
              iconColor={colors.text}
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
                <PrimaryButton
                  onPress={handleShare}
                  disabled={selectedIds.size === 0}
                  style={styles.shareButton}
                  icon={({ color }) => <MaterialCommunityIcons name="share-variant" size={16} color={color} />}
                >
                  {(t("favourites.share.button") as string).replace(
                    "{count}",
                    String(selectedIds.size),
                  )}
                </PrimaryButton>
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
    backgroundColor: colors.border,
  },
  viewShot: { backgroundColor: colors.appBackground, borderRadius: radius.card },
  content: {
    width: SCREEN_WIDTH - 30,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderRadius: 35,
    overflow: "hidden",
    ...Platform.select({
      android: {
        backgroundColor: colors.appBackground,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
      },
    }),
  },
  inner: { padding: spacing.xxl + 6, alignItems: "center" },
  closeButton: { position: "absolute", top: 0, right: 0, zIndex: 10 },
  title: {
    fontSize: 32,
    fontFamily: "Bebas",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  list: { maxHeight: SCREEN_HEIGHT * 0.45, width: "100%" },
  listContent: { paddingBottom: spacing.sm + 2 },
  columnWrapper: { justifyContent: "space-between", marginBottom: spacing.sm + 2 },
  shareButton: { marginTop: spacing.xl, borderRadius: radius.pill, width: "100%" },
  shareButtonContent: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xl },
  centeredBox: { alignItems: "center", justifyContent: "center", padding: spacing.xxl + 16 },
  loadingText: {
    marginTop: spacing.lg,
    color: colors.text,
    fontFamily: "Bebas",
    fontSize: fontSize.lg,
    letterSpacing: 1,
  },
  errorText: {
    marginTop: spacing.md,
    color: "#999",
    fontFamily: "Bebas",
    fontSize: fontSize.lg,
    letterSpacing: 1,
  },
});
