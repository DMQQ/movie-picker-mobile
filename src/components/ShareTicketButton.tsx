import { memo, useCallback, useRef, useState } from "react";
import IconButton from "./IconButton";
import Text from "./Text";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import useTranslation from "../service/useTranslation";
import TicketButton from "./TicketButton";

import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import CinemaTicket from "./CinemaTicket";
import { colors, common } from "../constants/design";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Genre {
  id: number;
  name: string;
}

interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface WatchProviders {
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
  free?: Provider[];
  ads?: Provider[];
}

interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  name?: string;
  type?: "movie" | "tv";
  mapped_genres?: string[];
  genres?: Genre[];
  tagline?: string;
}

interface ShareTicketButtonProps {
  movie: Movie;
  providers?: WatchProviders;
  headerText?: string;
  pickupLine?: string;
  holeColor?: string;
}

function ShareTicketButton({ movie, providers, headerText, pickupLine, holeColor = colors.appBackground }: ShareTicketButtonProps) {
  const t = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const openModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const captureAndShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        fileName: `${movie.title || movie.name}.png`,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `${movie.title || movie.name} - Movie Ticket`,
        });
      }
    } catch (error) {
      console.error("Failed to capture ticket:", error);
    }
  }, [movie?.title, movie?.name]);

  return (
    <>
      <TicketButton label={t("ticket.share-it") as string} onPress={openModal} holeColor={holeColor} />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />

          <View style={styles.modalContent}>
            <IconButton icon="close" size={24} onPress={closeModal} style={styles.closeButton} iconColor={colors.text} />

            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 1, fileName: `${movie.title || movie.name}.png` }}
              style={styles.viewShot}
            >
              <CinemaTicket movie={movie} providers={providers} headerText={headerText} pickupLine={pickupLine} />
            </ViewShot>

            <Pressable onPress={captureAndShare} style={({ pressed }) => [styles.shareButton, pressed && styles.shareButtonPressed]}>
              <Text style={styles.shareButtonText}>Share</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function IconShareButton({ movie }: { movie: Movie | null | undefined }) {
  if (!movie) return null;
  const [modalVisible, setModalVisible] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const openModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const captureAndShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        fileName: `${movie.title || movie.name}.png`,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `${movie.title || movie.name} - Movie Ticket`,
        });
      }
    } catch (error) {
      console.error("Failed to capture ticket:", error);
    }
  }, [movie?.title, movie?.name]);

  return (
    <>
      <IconButton icon="share-variant" size={28} style={common.iconButton} onPress={openModal} iconColor={colors.text} />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />

          <View style={styles.modalContent}>
            <IconButton icon="close" size={24} onPress={closeModal} style={styles.closeButton} iconColor={colors.text} />

            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 1, fileName: `${movie.title || movie.name}.png` }}
              style={styles.viewShot}
            >
              <CinemaTicket movie={movie} providers={{} as any} />
            </ViewShot>

            <Pressable onPress={captureAndShare} style={({ pressed }) => [styles.shareButton, pressed && styles.shareButtonPressed]}>
              <Text style={styles.shareButtonText}>Share</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalContent: {
    alignItems: "center",
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  closeButton: {
    position: "absolute",
    top: 25,
    right: 25,
    zIndex: 10,
    backgroundColor: colors.border,
  },
  viewShot: {
    backgroundColor: colors.appBackground,
    borderRadius: radius.card,
    overflow: "hidden",
  },
  shareButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl + 16,
    borderRadius: radius.pill,
  },
  shareButtonPressed: {
    opacity: 0.8,
  },
  shareButtonText: {
    fontFamily: "Bebas",
    fontSize: fontSize.xl,
    letterSpacing: 2,
    color: colors.input,
  },
});

export default memo(ShareTicketButton);
