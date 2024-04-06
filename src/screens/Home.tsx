import { useEffect, useState } from "react";
import { ToastAndroid, View, useWindowDimensions } from "react-native";
import { Button, Modal, Portal, Text, useTheme } from "react-native-paper";
import { socket } from "../service/socket";
import { Movie } from "../../types";
import { DarkTheme } from "@react-navigation/native";
import Poster from "../components/Movie/Poster";
import Content from "../components/Movie/Content";
import Card from "../components/Movie/Card";
import SwipeTile from "../components/Movie/SwipeTiles";
import HeaderButton from "../components/Overview/HeaderButton";

export default function Home({ route, navigation }: any) {
  const [cards, setCards] = useState<Movie[]>([]);
  const [match, setMatch] = useState<Movie | undefined>(undefined);
  const theme = useTheme();
  const window = useWindowDimensions();
  const room = route.params?.roomId;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderButton navigation={navigation} room={room} />,
    });
  }, []);

  useEffect(() => {
    socket.emit("join-room", room);

    socket.emit("get-movies", room);
    socket.on("movies", (cards) => {
      setCards(cards.movies);
    });

    socket.on("room-deleted", () => {
      navigation.goBack();
      ToastAndroid.show("Room has been deleted", ToastAndroid.SHORT);
    });

    socket.on("matched", (data: Movie) => {
      if (typeof match !== "undefined" || data == null) return;

      setMatch(data);
    });

    return () => {
      socket.off("room-joined");
      socket.off("movies");
      socket.emit("leave-room", room);
      socket.off("room-deleted");
    };
  }, []);

  const removeCardLocally = (index: number) => {
    setCards((prev) => {
      const _prev = [...prev];
      _prev.splice(index, 1);
      return _prev;
    });

    if (cards.length === 1) {
      socket.emit("finish", room);
      socket.emit("get-buddy-status", room);
    }
  };

  const likeCard = (card: Movie, index: number) => {
    socket.emit("pick-movie", {
      roomId: room,
      //  movie: card.title,
      movie: card.id,
      index,
    });
    removeCardLocally(index);
  };

  const dislikeCard = (index: number) => {
    socket.emit("pick-movie", {
      roomId: room,
      movie: 0,
      index,
    });
    removeCardLocally(index);
  };

  return (
    <View style={{ flex: 1 }}>
      {cards.map((card, index) => (
        <SwipeTile
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
          style={{ justifyContent: "center", alignItems: "center" }}
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
                height: window.height * 0.75,
              }}
            >
              <Poster card={match} />
              <Content {...match} />

              <Button
                mode="contained"
                onPress={() => setMatch(undefined)}
                style={{ marginTop: 15, borderRadius: 20 }}
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
