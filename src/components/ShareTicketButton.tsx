import { memo, useCallback, useRef, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import CinemaTicket from "./CinemaTicket";

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

function ShareTicketButton({ movie, providers, headerText, pickupLine, holeColor = "#000" }: ShareTicketButtonProps) {
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
      <View style={styles.ticketWrapper}>
        <Pressable onPress={openModal} style={({ pressed }) => [styles.ticketButton, pressed && styles.ticketButtonPressed]}>
          <View style={[styles.cornerHole, styles.cornerTopLeft, { backgroundColor: holeColor }]} />
          <View style={[styles.cornerHole, styles.cornerTopRight, { backgroundColor: holeColor }]} />
          <View style={[styles.cornerHole, styles.cornerBottomLeft, { backgroundColor: holeColor }]} />
          <View style={[styles.cornerHole, styles.cornerBottomRight, { backgroundColor: holeColor }]} />

          <Text style={styles.ticketButtonIcon}>🎟️</Text>
          <Text style={styles.ticketButtonText}>Share it!</Text>
        </Pressable>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />

          <View style={styles.modalContent}>
            <IconButton icon="close" size={24} onPress={closeModal} style={styles.closeButton} iconColor="#fff" />

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

export function IconShareButton({ movie }: { movie: Movie }) {
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
      <IconButton icon="share-variant" size={24} onPress={openModal} iconColor="#fff" />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />

          <View style={styles.modalContent}>
            <IconButton icon="close" size={24} onPress={closeModal} style={styles.closeButton} iconColor="#fff" />

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
  // Ticket Button
  ticketWrapper: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  ticketButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F0E1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 6,
    position: "relative",
  },
  ticketButtonPressed: {
    opacity: 0.95,
  },
  ticketButtonIcon: {
    fontSize: 16,
  },
  ticketButtonText: {
    fontFamily: "Bebas",
    fontSize: 16,
    letterSpacing: 1,
    color: "#1a1a1a",
  },
  cornerHole: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 10,
  },
  cornerTopLeft: {
    top: -5,
    left: -5,
  },
  cornerTopRight: {
    top: -5,
    right: -5,
  },
  cornerBottomLeft: {
    bottom: -5,
    left: -5,
  },
  cornerBottomRight: {
    bottom: -5,
    right: -5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  viewShot: {
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
  shareButton: {
    marginTop: 16,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 100,
  },
  shareButtonPressed: {
    opacity: 0.8,
  },
  shareButtonText: {
    fontFamily: "Bebas",
    fontSize: 18,
    letterSpacing: 2,
    color: "#1a1a1a",
  },
});

export default memo(ShareTicketButton);
