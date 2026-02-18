import { useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import CinemaTicket from "./CinemaTicket";

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

interface ShareableTicketProps {
  movie: Movie;
  providers?: WatchProviders;
  headerText?: string;
  pickupLine?: string;
  ticketColor?: string;
  accentColor?: string;
  showShareButton?: boolean;
  onCapture?: (uri: string) => void;
}

export default function ShareableTicket({
  movie,
  providers,
  headerText,
  pickupLine,
  ticketColor,
  accentColor,
  showShareButton = true,
  onCapture,
}: ShareableTicketProps) {
  const theme = useTheme();
  const viewShotRef = useRef<ViewShot>(null);

  const captureAndShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      onCapture?.(uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `${movie.title || movie.name} - Movie Ticket`,
        });
      }
    } catch (error) {
      console.error("Failed to capture ticket:", error);
    }
  }, [movie, onCapture]);

  const captureOnly = useCallback(async (): Promise<string | null> => {
    try {
      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      onCapture?.(uri);
      return uri;
    } catch (error) {
      console.error("Failed to capture ticket:", error);
      return null;
    }
  }, [onCapture]);

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }} style={styles.viewShot}>
        <CinemaTicket
          movie={movie}
          providers={providers}
          headerText={headerText}
          pickupLine={pickupLine}
          ticketColor={ticketColor}
          accentColor={accentColor}
        />
      </ViewShot>

      {showShareButton && (
        <Button
          mode="contained"
          onPress={captureAndShare}
          style={styles.shareButton}
          contentStyle={styles.shareButtonContent}
          labelStyle={styles.shareButtonLabel}
          icon="share-variant"
        >
          SHARE TICKET
        </Button>
      )}
    </View>
  );
}

// Hook for programmatic capture without rendering the share button
export function useTicketCapture() {
  const viewShotRef = useRef<ViewShot>(null);

  const capture = useCallback(async (): Promise<string | null> => {
    try {
      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      return uri;
    } catch (error) {
      console.error("Failed to capture ticket:", error);
      return null;
    }
  }, []);

  const share = useCallback(
    async (movieTitle: string): Promise<void> => {
      const uri = await capture();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: `${movieTitle} - Movie Ticket`,
        });
      }
    },
    [capture],
  );

  return { viewShotRef, capture, share };
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  viewShot: {
    backgroundColor: "#000",
  },
  shareButton: {
    marginTop: 20,
    borderRadius: 100,
  },
  shareButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  shareButtonLabel: {
    fontFamily: "Bebas",
    fontSize: 18,
    letterSpacing: 2,
  },
});
