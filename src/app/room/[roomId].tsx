import { View } from "react-native";
import { useAppSelector } from "../../redux/store";
import RoomLoader from "../../components/RoomLoader";
import RoomEmptyState from "../../components/RoomEmptyState";
import HomeAppbar from "../../components/Home/Appbar";
import SwipeHintOverlay from "../../components/SwipeHintOverlay";
import RoomErrorModal from "../../components/Room/RoomErrorModal";
import GameEndFlow from "../../components/Room/GameEndFlow";
import SwipeContent from "../../components/Room/SwipeContent";
import RoomMatches from "../../components/Room/RoomMatches";
import useRoomScreen from "../../hooks/useRoomScreen";
import { colors } from "../../constants/design";
import useRoomToasts from "../../hooks/useRoomToasts";
import AsyncJoinOverlay from "../../components/AsyncJoinOverlay";

function RoomScreenListener() {
  useRoomScreen();
  useRoomToasts();
  return null;
}

export default function RoomScreen() {
  const isPlaying = useAppSelector((state) => state.room.isPlaying && state.room.beenFired);
  const hasCards = useAppSelector((state) => state.room.movies.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }}>
      <RoomScreenListener />
      <HomeAppbar />

      {isPlaying ? (
        <>
          <SwipeContent />
          {hasCards ? <SwipeHintOverlay /> : <RoomEmptyState />}
        </>
      ) : (
        <RoomLoader />
      )}

      <AsyncJoinOverlay />
      <RoomErrorModal />
      <GameEndFlow />
      <RoomMatches />
    </View>
  );
}
