import { memo, useCallback, useEffect, useRef } from "react";
import IconButton from "../IconButton";
import Text from "../Text";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";

import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FancySpinner } from "../FancySpinner";
import MarathonTicket from "../MarathonTicket";
import { useLazyGetSummaryShareQuery } from "../../redux/movie/movieApi";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, radius, spacing} from "../../constants/design";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  roomId: string;
}

export default memo(function ShareModal({ visible, onClose, roomId }: Props) {
  const viewShotRef = useRef<ViewShot>(null);
  const [fetchSummaryShare, { data, isLoading, error }] =
    useLazyGetSummaryShareQuery();
  const t = useTranslation();

  useEffect(() => {
    if (visible && roomId) fetchSummaryShare({ roomId });
  }, [visible, roomId, fetchSummaryShare]);

  const captureAndShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        fileName: `marathon-${roomId}.png`,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: t("game-summary.share.dialog-title") as string,
        });
      }
    } catch (err) {
      console.error("Failed to capture ticket:", err);
    } finally {
      onClose();
    }
  }, [roomId, onClose]);

  useEffect(() => {
    if (!data || !visible) return;
    const timeout = setTimeout(() => captureAndShare(), 500);
    return () => clearTimeout(timeout);
  }, [data, visible, captureAndShare]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.content}>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.closeBtn}
            iconColor={colors.appBackground}
          />
          {isLoading ? (
            <View style={styles.centered}>
              <FancySpinner size={60} />
              <Text style={styles.loadingText}>
                {t("game-summary.share.loading")}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <MaterialCommunityIcons
                name="error-outline"
                size={48}
                color="#ff6b6b"
              />
              <Text style={styles.errorText}>
                {t("game-summary.share.error")}
              </Text>
            </View>
          ) : data?.movies && data.movies.length > 0 ? (
            <ViewShot
              ref={viewShotRef}
              options={{
                format: "png",
                quality: 1,
                fileName: `marathon-${roomId}.png`,
              }}
              style={styles.viewShot}
            >
              <MarathonTicket movies={data.movies} />
            </ViewShot>
          ) : (
            <View style={styles.centered}>
              <MaterialCommunityIcons name="movie" size={48} color="#666" />
              <Text style={styles.errorText}>
                {t("game-summary.share.no-movies")}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.85)" },
  content: { alignItems: "center", maxHeight: SCREEN_HEIGHT * 0.9 },
  closeBtn: {
    position: "absolute",
    top: 25,
    right: 25,
    zIndex: 10,
    backgroundColor: colors.border,
  },
  viewShot: { backgroundColor: colors.appBackground, borderRadius: radius.card, overflow: "hidden" },
  centered: { alignItems: "center", justifyContent: "center", padding: spacing.xxl + 16 },
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
