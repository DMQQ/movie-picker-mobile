import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import SwipeTile from "../components/Movie/SwipeTiles";
import useRoom from "../service/useRoom";
import { ScreenProps } from "./types";
import { Movie } from "../../types";
import { useRef, useState } from "react";
import MatchModal from "../components/Movie/MatchModal";
import DialogModals from "../components/Home/DialogModals";
import HomeAppbar from "../components/Home/Appbar";

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

export default function Home({ route, navigation }: ScreenProps<"Home">) {
  const {
    cards,
    dislikeCard,
    likeCard,
    match,
    showLeaveModal,
    toggleLeaveModal,
    hideMatchModal,
  } = useRoom(route.params?.roomId);
  const isFocused = useIsFocused();
  const [showQRModal, setShowQRModal] = useState(false);

  const originalLength = useRef(cards.length);

  const handleNavigateDetails = (card: Movie) => {
    navigation.navigate("MovieDetails", {
      id: card.id,
      type: route.params?.type || "movie",
      img: card.poster_path,
    });
  };

  return (
    <View style={{ flex: 1 }}>
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

      {cards.length === 0 && (
        <View style={styles.emptyListContainer}>
          <Text style={{ fontSize: 20 }}>Waiting for other players</Text>
        </View>
      )}

      {cards.map((card, index) => (
        <SwipeTile
          onPress={() => handleNavigateDetails(card)}
          length={originalLength.current}
          key={card.id}
          card={card}
          index={index}
          likeCard={() => likeCard(card, index)}
          removeCard={() => dislikeCard(index)}
        />
      ))}

      {isFocused && (
        <MatchModal hideMatchModal={hideMatchModal} match={match} />
      )}
    </View>
  );
}
