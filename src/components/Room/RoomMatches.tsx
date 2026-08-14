import { memo } from "react";
import useRoomMatches from "../../service/useRoomMatches";
import MatchModal from "../Movie/MatchModal";
import { useAppSelector } from "../../redux/store";

const RoomMatches = memo(() => {
  const roomId = useAppSelector((state) => state.room.roomId);
  const authUserId = useAppSelector((state) => state.auth.user?.id);
  const userId = useAppSelector((state) => state.app.userId);
  const { isFocused, hideMatchModal, match, partialMatch, hidePartialMatch, overrideSwipe } = useRoomMatches(roomId);

  const isPartial = !match && !!partialMatch;
  const displayMatch = match ?? partialMatch?.movie;
  const onDismiss = isPartial ? hidePartialMatch : hideMatchModal;
  const didLike = isPartial
    ? partialMatch!.likedBy.some((u) => u.userId === userId || u.userId === authUserId)
    : undefined;
  const onReconsider =
    isPartial && didLike === false
      ? () => overrideSwipe(partialMatch!.movie.id)
      : undefined;

  return isFocused ? (
    <MatchModal
      match={displayMatch}
      hideMatchModal={onDismiss}
      likedBy={isPartial ? partialMatch!.likedBy : undefined}
      totalUsers={isPartial ? partialMatch!.totalUsers : undefined}
      didLike={didLike}
      onReconsider={onReconsider}
    />
  ) : null;
});

export default RoomMatches;
