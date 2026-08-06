import { memo, useContext } from "react";
import useRoomMatches from "../../service/useRoomMatches";
import MatchModal from "../Movie/MatchModal";
import { useAppSelector } from "../../redux/store";
import { SocketContext } from "../../context/SocketContext";

const RoomMatches = memo(() => {
  const roomId = useAppSelector((state) => state.room.roomId);
  const authUserId = useAppSelector((state) => state.auth.user?.id);
  const { userId } = useContext(SocketContext);
  const { isFocused, hideMatchModal, match, partialMatch, hidePartialMatch } = useRoomMatches(roomId);

  const isPartial = !match && !!partialMatch;
  const displayMatch = match ?? partialMatch?.movie;
  const onDismiss = isPartial ? hidePartialMatch : hideMatchModal;
  const didLike = isPartial
    ? partialMatch!.likedBy.some((u) => u.userId === userId || u.userId === authUserId)
    : undefined;

  return isFocused ? (
    <MatchModal
      match={displayMatch}
      hideMatchModal={onDismiss}
      likedBy={isPartial ? partialMatch!.likedBy : undefined}
      totalUsers={isPartial ? partialMatch!.totalUsers : undefined}
      didLike={didLike}
    />
  ) : null;
});

export default RoomMatches;
