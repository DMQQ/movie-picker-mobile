import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
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
  const { cards, dislikeCard, likeCard, match, showLeaveModal, toggleLeaveModal, hideMatchModal, isPlaying, joinGame } = useRoom(
    route.params?.roomId
  );
  const isFocused = useIsFocused();
  const [showQRModal, setShowQRModal] = useState(false);
  const { gameEnded, isGameFinished, likes } = useAppSelector((state) => state.room.room);

  const [hasUserPlayed, setHasUserPlayed] = useState(false);

  useEffect(() => {
    if (likes.length > 0 || (cards.length > 0 && cards.length < 20)) {
      setHasUserPlayed(true);
    }
  }, [likes.length, cards.length]);

  useEffect(() => {
    if (gameEnded && hasUserPlayed && isPlaying === false) {
      const timer = setTimeout(() => {
        navigation.replace("GameSummary", { roomId: route.params?.roomId });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameEnded, hasUserPlayed, isPlaying, navigation, route.params?.roomId]);
  const originalLength = useRef(cards.length);

  useEffect(() => {
    if (route?.params?.roomId) {
      navigation.setParams({
        roomId: route?.params?.roomId,
      });
      joinGame(route?.params?.roomId);
    }
  }, [route?.params?.roomId]);

  const handleNavigateDetails = (card: Movie) => {
    navigation.navigate("MovieDetails", {
      id: card.id,
      type: route.params?.type || "movie",
      img: card.poster_path,
    });
  };

  const insets = useSafeAreaInsets();

  const t = useTranslation();

  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <HomeAppbar
        cards={cards}
        route={route}
        setShowQRModal={setShowQRModal}
        showQRModal={showQRModal}
        toggleLeaveModal={toggleLeaveModal}
      />
      <DialogModals
        route={route}
        showLeaveModal={showLeaveModal}
        toggleLeaveModal={toggleLeaveModal}
        showQRModal={showQRModal}
        setShowQRModal={setShowQRModal}
      />

      {isPlaying ? (
        <>
          {cards.map((card, index) => (
            <SwipeTile
              onPress={() => handleNavigateDetails(card)}
              length={originalLength.current}
              key={card.id}
              card={card}
              index={index}
              likeCard={throttle(() => likeCard(card, index), 500)}
              removeCard={throttle(() => dislikeCard(index), 500)}
            />
          ))}

          {cards.length === 0 && (
            <View style={styles.emptyListContainer}>
              <Text style={{ fontSize: 20 }}>{isGameFinished ? t("room.finished") : t("room.waiting")}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyListContainer}>
          <FancySpinner />
          <Text style={{ fontSize: 20, marginTop: 15 }}>Wait for start</Text>
        </View>
      )}

      {isFocused && <MatchModal hideMatchModal={hideMatchModal} match={match} />}
    </View>
  );
}
