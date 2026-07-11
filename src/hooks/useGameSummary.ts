import { useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as StoreReview from "expo-store-review";
import { Image } from "expo-image";
import { SocketContext } from "../context/SocketContext";
import useTranslation from "../service/useTranslation";
import { roomActions } from "../redux/room/roomSlice";
import { reset } from "../redux/roomBuilder/roomBuilderSlice";
import { useAppDispatch } from "../redux/store";
import ReviewManager from "../utils/rate";
import { useMatches } from "../context/DatabaseContext";
import { IGameSummary } from "../components/GameSummary/types";

export function useGameSummary(roomId: string) {
  const { socket, userId } = useContext(SocketContext);
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const { matches: matchesRepo } = useMatches();

  const [summary, setSummary] = useState<IGameSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowRatingPill, setShouldShowRatingPill] = useState(false);

  useEffect(() => {
    if (matchesRepo && roomId) matchesRepo.markSessionViewed(roomId);
  }, [matchesRepo, roomId]);

  useEffect(() => {
    const fetch = async () => {
      if (!socket || !roomId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await socket.emitWithAck("get-game-summary", roomId);
        if (response.success) {
          if (response.summary?.type)
            response.summary.type = response.summary.type.includes("movie") ? "movie" : "tv";
          setSummary(response.summary);
        } else {
          setError(response.error);
        }
      } catch {
        setError(t("game-summary.failed-to-load") as string);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [socket, roomId]);

  useEffect(() => {
    return () => {
      dispatch(roomActions.reset());
      dispatch(reset());
      Image.clearMemoryCache();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const lowMatches = (summary?.matchedMovies.length || 0) < 5;
      const canReview =
        (await ReviewManager.canRequestReviewFromRating()) &&
        Platform.OS !== "web" &&
        (await StoreReview.isAvailableAsync());
      if (lowMatches || !canReview) {
        setShouldShowRatingPill(true);
      } else if (Platform.OS !== "web" && (await StoreReview.hasAction())) {
        await StoreReview.requestReview();
        await ReviewManager.recordReviewRequestFromRating();
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [summary, userId]);

  return { summary, loading, error, shouldShowRatingPill, userId };
}
