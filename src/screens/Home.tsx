import { Dimensions, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Dialog,
  Modal,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import {
  CommonActions,
  DarkTheme,
  useIsFocused,
} from "@react-navigation/native";
import Poster from "../components/Movie/Poster";
import Content from "../components/Movie/Content";
import Card from "../components/Movie/Card";
import SwipeTile from "../components/Movie/SwipeTiles";
import HeaderButton from "../components/Overview/HeaderButton";
import useRoom from "../service/useRoom";
import { Props } from "./types";
import { Movie } from "../../types";
import { useContext, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SocketContext } from "../service/SocketContext";
import { roomActions } from "../redux/room/roomSlice";

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
    padding: 20,
    borderRadius: 20,
  },
  matchText: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "left",
    margin: 10,
  },
  matchCard: {
    justifyContent: "flex-start",
    position: "relative",
    transform: [{ translateY: -15 }],
    height: "auto",
    marginTop: 15,
    minHeight: Dimensions.get("screen").height / 1.5,
  },
  matchClose: {
    marginVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
});

export default function Home({ route, navigation }: Props<"Home">) {
  const {
    cards,
    dislikeCard,
    likeCard,
    match,
    showLeaveModal,
    toggleLeaveModal,
    hideMatchModal,
  } = useRoom(route.params?.roomId);
  const theme = useTheme();

  const [showQRModal, setShowQRModal] = useState(false);
  const qrCode = useAppSelector((state) => state.room.room.roomId);
  const { userId } = useContext(SocketContext);

  const handleNavigateDetails = (card: Movie) => {
    navigation.navigate("MovieDetails", {
      id: card.id,
      type: route.params?.type || "movie",
    });
  };

  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);

  const handleLeaveRoom = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Landing" }],
      })
    );
    dispatch(roomActions.reset());
    socket?.emit("leave-room", route.params?.roomId);
  };

  const isFocused = useIsFocused();

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Button onPress={toggleLeaveModal}>Leave</Button>

        <Appbar.Content title="" />

        <Appbar.Action
          color={theme.colors.primary}
          size={17}
          icon="qrcode-scan"
          onPress={() => setShowQRModal((p) => !p)}
        />

        <Appbar.Action
          size={20}
          color={theme.colors.primary}
          icon="heart"
          onPress={() => navigation.navigate("Overview")}
        />
      </Appbar.Header>

      <Portal>
        <Dialog
          visible={showLeaveModal}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Leave Room</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to leave the room?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={toggleLeaveModal}>Cancel</Button>
            <Button onPress={handleLeaveRoom}>Leave</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showQRModal}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 10,
            paddingBottom: 10,
          }}
        >
          <Dialog.Title>QR Code</Dialog.Title>
          <Dialog.Content>
            <Text>Scan this code to join the room</Text>
          </Dialog.Content>

          <Dialog.Content>
            <QRCode
              backgroundColor={theme.colors.surface}
              color={theme.colors.primary}
              value={JSON.stringify({
                roomId: qrCode,
                host: userId,
                type: "join",
              })}
              size={Dimensions.get("screen").width / 1.35}
            />
            <Text
              style={{
                color: theme.colors.primary,
                textAlign: "center",
                marginTop: 5,
                fontSize: 18,
              }}
            >
              {qrCode}
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => setShowQRModal(false)}>Close</Button>
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

      {isFocused && (
        <Portal theme={DarkTheme}>
          <Modal
            dismissable
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
                  style={[styles.matchClose]}
                  contentStyle={{ padding: 5 }}
                  buttonColor={theme.colors.primary}
                >
                  Close
                </Button>
              </Card>
            )}
          </Modal>
        </Portal>
      )}
    </View>
  );
}
