import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Movie } from "../../../types";
import { FancySpinner } from "../../components/FancySpinner";
import HomeAppbar from "../../components/Home/Appbar";
import DialogModals from "../../components/Home/DialogModals";
import MatchModal from "../../components/Movie/MatchModal";
import SwipeTile from "../../components/Movie/SwipeTiles";
import { useAppSelector } from "../../redux/store";
import useRoom from "../../service/useRoom";
import useTranslation from "../../service/useTranslation";
import { throttle } from "../../utils/throttle";
import useRoomMatches from "../../service/useRoomMatches";
import { SocketContext } from "../../service/SocketContext";

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
});

export default function Home({ route, navigation }: any) {
  const { cards, dislikeCard, likeCard, isPlaying, joinGame, cardsLoading } = useRoom(route.params?.roomId);
  const { socket } = useContext(SocketContext);
  const likes = useAppSelector((state) => state.room.room.likes);
  const gameEnded = useAppSelector((state) => state.room.room.gameEnded);

  const [hasUserPlayed, setHasUserPlayed] = useState(false);

  useEffect(() => {
    if (likes.length > 0 || (cards.length > 0 && cards.length < 20)) {
      setHasUserPlayed(true);
    }
  }, [likes.length, cards.length]);

  useEffect(() => {
    if (gameEnded && isPlaying === false) {
      const timer = setTimeout(() => {
        navigation.replace("GameSummary", { roomId: route.params?.roomId });
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [gameEnded, hasUserPlayed, isPlaying, navigation, route.params?.roomId]);

  const originalLength = useRef(cards.length);

  useEffect(() => {
    if (route?.params?.roomId && socket?.connected) {
      console.log("🔑 Joining room:", route?.params?.roomId);
      joinGame(route?.params?.roomId);
    }
  }, [route?.params?.roomId, socket, socket?.connected]);

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

  const insets = useSafeAreaInsets();

  const t = useTranslation();

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
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <HomeAppbar route={route} hasCards={cards.length > 0} />

      {isPlaying ? (
        <>
          {renderedCards}

          {cards.length === 0 && !cardsLoading && (
            <View style={styles.emptyListContainer}>
              {!gameEnded && hasUserPlayed && (
                <Text
                  style={{
                    fontSize: 40,
                    fontFamily: "Bebas",
                    color: "#fff",
                    width: "80%",
                    textAlign: "center",
                  }}
                >
                  {t("room.no-more-results")}
                </Text>
              )}
              <Text style={{ fontSize: 20, width: "80%", textAlign: "center" }}>{gameEnded ? t("room.finished") : t("room.waiting")}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyListContainer}>
          <FancySpinner />
          <Text style={{ fontSize: 20, marginTop: 15, textAlign: "center", width: "80%" }}>
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
