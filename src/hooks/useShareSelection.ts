import { useCallback, useEffect, useRef, useState, type ElementRef } from "react";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { useShareMoviesMutation } from "../redux/movie/movieApi";
import useTranslation from "../service/useTranslation";

export const MAX_SELECTION = 7;

export type ShareMovie = { id: number; imageUrl: string; type: "movie" | "tv" };

export function useShareSelection(movies: ShareMovie[]) {
  const viewShotRef = useRef<ElementRef<typeof ViewShot>>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(movies.slice(0, Math.min(MAX_SELECTION, movies.length)).map((m) => m.id)),
  );
  const [shareMovies, { data, isLoading, error }] = useShareMoviesMutation();
  const [isSharing, setIsSharing] = useState(false);
  const t = useTranslation();

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

  const captureAndShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await captureRef(viewShotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        fileName: "collection-share.png",
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
  }, [t]);

  const handleShare = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const selected = movies
      .filter((m) => selectedIds.has(m.id))
      .map((m) => ({ id: m.id, type: m.type }));
    setIsSharing(true);
    await shareMovies({ movies: selected });
  }, [selectedIds, movies, shareMovies]);

  useEffect(() => {
    if (!data || !isSharing) return;
    const timeout = setTimeout(captureAndShare, 500);
    return () => clearTimeout(timeout);
  }, [data, isSharing, captureAndShare]);

  return { viewShotRef, selectedIds, toggleSelection, handleShare, isLoading, isSharing, error, data };
}
