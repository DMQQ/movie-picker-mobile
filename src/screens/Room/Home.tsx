import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import SwipeTile from "../../components/Movie/SwipeTiles";
import useRoom from "../../service/useRoom";
import { ScreenProps } from "../types";
import { Movie } from "../../../types";
import { useEffect, useRef, useState } from "react";
import MatchModal from "../../components/Movie/MatchModal";
import DialogModals from "../../components/Home/DialogModals";
import HomeAppbar from "../../components/Home/Appbar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTranslation from "../../service/useTranslation";

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

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
  const { cards, dislikeCard, likeCard, match, showLeaveModal, toggleLeaveModal, hideMatchModal } = useRoom(route.params?.roomId);
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

      {cards.length === 0 && (
        <View style={styles.emptyListContainer}>
          <Text style={{ fontSize: 20 }}>{t("room.waiting")}</Text>
        </View>
      )}

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

      {isFocused && <MatchModal hideMatchModal={hideMatchModal} match={match} />}
    </View>
  );
}
