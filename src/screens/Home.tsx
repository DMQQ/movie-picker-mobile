import { useContext, useEffect, useState } from "react";
import { ToastAndroid, View, useWindowDimensions } from "react-native";
import {
  Button,
  Dialog,
  Modal,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { Movie } from "../../types";
import { CommonActions, DarkTheme } from "@react-navigation/native";
import Poster from "../components/Movie/Poster";
import Content from "../components/Movie/Content";
import Card from "../components/Movie/Card";
import SwipeTile from "../components/Movie/SwipeTiles";
import HeaderButton from "../components/Overview/HeaderButton";
import { SocketContext } from "../service/SocketContext";
import { useAppDispatch } from "../redux/store";
import { roomActions } from "../redux/room/roomSlice";

export default function Home({ route, navigation }: any) {
  const [cards, setCards] = useState<Movie[]>([]);
  const [match, setMatch] = useState<Movie | undefined>(undefined);
  const theme = useTheme();
  const room = route.params?.roomId;
  const dispatch = useAppDispatch();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    socket?.emit("join-room", room);
    socket?.emit("get-movies", room);
    socket?.emit("get-room-details", room);

    socket?.on("movies", (cards) => {
      setCards(cards.movies);
    });

    socket?.on("room-details", (data) => {
      if (data !== undefined) dispatch(roomActions.setRoom(data));
    });

    socket?.on("room-deleted", () => {
      navigation.goBack();
      ToastAndroid.show("Room has been deleted", ToastAndroid.SHORT);
    });

    socket?.on("matched", (data: Movie) => {
      if (typeof match !== "undefined" || data == null) return;

      setMatch(data);
    });

    return () => {
      socket?.off("room-joined");
      socket?.off("movies");
      socket?.emit("leave-room", room);
      socket?.off("room-deleted");
      socket?.off("matched");
      socket?.off("room-details");
    };
  }, []);

  const removeCardLocally = (index: number) => {
    setCards((prev) => {
      const _prev = [...prev];
      _prev.splice(index, 1);
      return _prev;
    });

    if (cards.length === 1) {
      socket?.emit("finish", room);
      socket?.emit("get-buddy-status", room);
    }
  };

  const likeCard = (card: Movie, index: number) => {
    socket?.emit("pick-movie", {
      roomId: room,
      movie: card.id,
      index,
    });
    removeCardLocally(index);
  };

  const dislikeCard = (index: number) => {
    socket?.emit("pick-movie", {
      roomId: room,
      movie: 0,
      index,
    });
    removeCardLocally(index);
  };

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          justifyContent: "space-between",

          backgroundColor: theme.colors.surface,
        }}
      >
        <Button onPress={() => setShowLeaveModal((p) => !p)}>Leave</Button>
        <HeaderButton navigation={navigation} room={room} />
      </View>

      <Portal>
        <Dialog visible={showLeaveModal}>
          <Dialog.Title>Leave Room</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to leave the room?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLeaveModal(false)}>Cancel</Button>
            <Button
              onPress={() =>
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Landing" }],
                  })
                )
              }
            >
              Leave
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {cards.length === 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20 }}>No movies left</Text>
        </View>
      )}

      {cards.map((card, index) => (
        <SwipeTile
          onPress={() =>
            navigation.navigate("MovieDetails", {
              id: card.id,
              type: route.params?.type || "movie",
            })
          }
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
          onDismiss={() => setMatch(undefined)}
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Text
            style={{
              fontSize: 35,
              fontWeight: "bold",
              textAlign: "left",
              margin: 10,
              color: theme.colors.primary,
            }}
          >
            It's a match!
          </Text>
          {typeof match !== "undefined" && (
            <Card
              style={{
                backgroundColor: theme.colors.surface,
                justifyContent: "flex-end",
                position: "relative",
                transform: [{ translateY: -10 }],
                height: "auto",
              }}
            >
              <Poster card={match} />

              <Content theme={theme} {...match} />

              <Button
                mode="contained"
                onPress={() => setMatch(undefined)}
                style={{
                  marginVertical: 10,
                  borderRadius: 20,
                  marginHorizontal: 10,
                }}
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
