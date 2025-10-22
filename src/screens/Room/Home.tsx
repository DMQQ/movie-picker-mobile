import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Movie } from "../../../types";
import { FancySpinner } from "../../components/FancySpinner";
import HomeAppbar from "../../components/Home/Appbar";
import MatchModal from "../../components/Movie/MatchModal";
import SwipeTile from "../../components/Movie/SwipeTiles";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import useTranslation from "../../service/useTranslation";
import { throttle } from "../../utils/throttle";
import useRoomMatches from "../../service/useRoomMatches";
import useRoomContext from "./RoomContext";
import { roomActions } from "../../redux/room/roomSlice";

const styles = StyleSheet.create({
  navigation: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noResultsText: {
    fontSize: 40,
    fontFamily: "Bebas",
    color: "#fff",
    width: "80%",
    textAlign: "center",
  },

  gameStatus: { fontSize: 20, width: "80%", textAlign: "center" },

  gameFinishStatus: { fontSize: 20, marginTop: 15, textAlign: "center", width: "80%" },
});

export default function Home({ route, navigation }: any) {
  const { cards, dislikeCard, likeCard, isPlaying, cardsLoading, roomId } = useRoomContext();
  const hasUserPlayed = useAppSelector((state) => state.room.room.hasUserPlayed);
  const gameEnded = useAppSelector((state) => state.room.room.gameEnded);
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const originalLength = useRef(cards.length);

  useEffect(() => {
    if (route.params?.roomId) dispatch(roomActions.setRoomId(route.params?.roomId));
  }, [route.params?.roomId]);

  useEffect(() => {
    if (gameEnded && isPlaying === false) {
      const timer = setTimeout(() => {
        navigation.replace("GameSummary", { roomId: roomId });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameEnded, hasUserPlayed, isPlaying, navigation, roomId]);

  const handleNavigateDetails = useCallback(
    (card: Movie) => {
      navigation.navigate("MovieDetails", {
        id: card.id,
        type: route.params?.type || "movie",
        img: card.poster_path,
      });
    },
    [route.params?.type]
  );

  const renderedCards = useMemo(
    () =>
      cards.map((card, index) => (
        <SwipeTile
          onPress={handleNavigateDetails.bind(null, card)}
          length={originalLength.current}
          key={card.id}
          card={card}
          index={index}
          likeCard={throttle(() => likeCard(card, index), 500)}
          removeCard={throttle(() => dislikeCard(card, index), 500)}
        />
      )),
    [cards, dislikeCard, handleNavigateDetails, likeCard]
  );

  return (
    <View style={{ flex: 1 }}>
      <HomeAppbar route={route} hasCards={cards.length > 0} />

      {isPlaying ? (
        <>
          {renderedCards}

          {cards.length === 0 && !cardsLoading && (
            <View style={styles.emptyListContainer}>
              {!gameEnded && hasUserPlayed && <Text style={styles.noResultsText}>{t("room.no-more-results")}</Text>}
              <Text style={styles.gameStatus}>{gameEnded ? t("room.finished") : t("room.waiting")}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyListContainer}>
          <FancySpinner />
          <Text style={styles.gameFinishStatus}>
            {gameEnded ? t("room.finished") : cardsLoading ? t("room.loading") : t("room.awaiting-start")}
          </Text>
        </View>
      )}

      <Matches roomId={route.params?.roomId} />
    </View>
  );
}

const Matches = memo(({ roomId }: { roomId: string }) => {
  const { isFocused, hideMatchModal, match } = useRoomMatches(roomId);

  return isFocused && <MatchModal hideMatchModal={hideMatchModal} match={match} />;
});
