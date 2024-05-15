import { Dimensions, StyleSheet, View } from "react-native";
import {
  Appbar,
  Avatar,
  Button,
  Dialog,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { CommonActions, useIsFocused } from "@react-navigation/native";

import SwipeTile from "../components/Movie/SwipeTiles";
import useRoom from "../service/useRoom";
import { Props } from "./types";
import { Movie } from "../../types";
import { useContext, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { SocketContext } from "../service/SocketContext";
import { roomActions } from "../redux/room/roomSlice";
import MatchModal from "../components/Movie/MatchModal";
import ActiveUsers from "../components/Home/ActiveUsers";

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
  const { roomId: qrCode } = useAppSelector((state) => state.room.room);

  const handleNavigateDetails = (card: Movie) => {
    navigation.navigate("MovieDetails", {
      id: card.id,
      type: route.params?.type || "movie",
      img: card.poster_path,
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

        <ActiveUsers />

        {!(cards.length > 0) && (
          <Appbar.Action
            color={theme.colors.primary}
            size={22}
            icon="refresh"
            onPress={() => {
              socket?.emit("leave-room", route.params?.roomId);
              socket?.emit("join-room", route.params?.roomId);
            }}
          />
        )}

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
          style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}
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
                host: "dmq",
                type: "movies",
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
          <Text style={{ fontSize: 20 }}>Waiting for other players</Text>
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
        <MatchModal hideMatchModal={hideMatchModal} match={match} />
      )}
    </View>
  );
}
