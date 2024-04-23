import { StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  Modal,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { CommonActions, DarkTheme } from "@react-navigation/native";
import Poster from "../components/Movie/Poster";
import Content from "../components/Movie/Content";
import Card from "../components/Movie/Card";
import SwipeTile from "../components/Movie/SwipeTiles";
import HeaderButton from "../components/Overview/HeaderButton";
import useRoom from "../service/useRoom";
import { Props } from "./types";
import { Movie } from "../../types";

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
  matchModal: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "white",
  },
  matchText: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "left",
    margin: 10,
  },
  matchCard: {
    justifyContent: "flex-end",
    position: "relative",
    transform: [{ translateY: -10 }],
    height: "auto",
  },
  matchClose: {
    marginVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
});

export default function Home({ route, navigation }: Props<"Home">) {
  const roomId = route.params?.roomId;

  const {
    cards,
    dislikeCard,
    likeCard,
    match,
    showLeaveModal,
    toggleLeaveModal,
    hideMatchModal,
  } = useRoom(roomId);
  const theme = useTheme();

  const handleNavigateDetails = (card: Movie) => {
    navigation.navigate("MovieDetails", {
      id: card.id,
      type: route.params?.type || "movie",
    });
  };

  const handleLeaveRoom = () =>
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Landing" }],
      })
    );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[styles.navigation, { backgroundColor: theme.colors.surface }]}
      >
        <Button onPress={toggleLeaveModal}>Leave</Button>
        <HeaderButton navigation={navigation} room={roomId} />
      </View>

      <Portal>
        <Dialog visible={showLeaveModal}>
          <Dialog.Title>Leave Room</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to leave the room?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={toggleLeaveModal}>Cancel</Button>
            <Button onPress={handleLeaveRoom}>Leave</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {cards.length === 0 && (
        <View style={styles.emptyListContainer}>
          <Text style={{ fontSize: 20 }}>No movies left</Text>
        </View>
      )}

      {cards.map((card, index) => (
        <SwipeTile
          onPress={() => handleNavigateDetails(card)}
          length={cards.length}
          key={card.id}
          card={card}
          index={index}
          likeCard={() => likeCard(card, index)}
          removeCard={() => dislikeCard(index)}
        />
      ))}

      <Portal theme={DarkTheme}>
        <Modal
          dismissableBackButton
          visible={typeof match !== "undefined"}
          onDismiss={hideMatchModal}
          style={styles.matchModal}
        >
          <Text style={[styles.matchText, { color: theme.colors.primary }]}>
            It's a match!
          </Text>
          {typeof match !== "undefined" && (
            <Card
              style={[
                styles.matchCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Poster card={match} />

              <Content theme={theme} {...match} />

              <Button
                mode="contained"
                onPress={hideMatchModal}
                style={styles.matchClose}
                contentStyle={{ padding: 5 }}
                buttonColor={theme.colors.primary}
              >
                Close
              </Button>
            </Card>
          )}
        </Modal>
      </Portal>
    </View>
  );
}
