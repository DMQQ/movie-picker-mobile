import { useEffect, useState } from "react";
import { Image, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Button, Modal, Portal, Text, useTheme } from "react-native-paper";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { socket } from "../service/socket";
import { Movie } from "../../types";
import { DarkTheme } from "@react-navigation/native";
import Poster from "../components/Movie/Poster";
import Content from "../components/Movie/Content";
import Card from "../components/Movie/Card";

export default function Home({ route, navigation }: any) {
  const [cards, setCards] = useState<Movie[]>([]);
  const [match, setMatch] = useState<Movie | undefined>(undefined);
  const [buddyFinished, setBuddyFinished] = useState<boolean>(false);
  const theme = useTheme();
  const window = useWindowDimensions();
  const room = route.params?.roomId;

  useEffect(() => {
    socket.emit("join-room", room);

    socket.emit("get-movies", room);
    socket.on("movies", (cards) => {
      setCards(cards.movies);
    });

    socket.on("buddy-status", (data: { finished: boolean }) => {
      setBuddyFinished(data.finished);
    });

    socket.on("room-deleted", () => {
      navigation.goBack();
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

  return (
    <View style={{ flex: 1 }}>
      {cards.map((card, index) => (
        <Tile
          length={cards.length}
          key={card.id}
          card={card}
          index={index}
          likeCard={() => {
            socket.emit("pick-movie", {
              roomId: room,
              //  movie: card.title,
              movie: card.id,
              index,
            });
            removeCardLocally(index);
          }}
          removeCard={() => {
            socket.emit("pick-movie", {
              roomId: room,
              movie: 0,
              index,
            });
            removeCardLocally(index);
          }}
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
              fontSize: 30,
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
                mode="elevated"
                onPress={() => {
                  setMatch(undefined);
                }}
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

const Tile = ({
  card,
  index,
  likeCard,
  removeCard,
  length,
}: {
  card: Movie;
  index: number;
  likeCard: () => void;
  removeCard: () => void;
  length: number;
}) => {
  const { width, height } = useWindowDimensions();
  const position = useSharedValue({ x: 0, y: 0 });

  const moveGesture = Gesture.Pan()
    .onChange(({ translationX, translationY }) => {
      position.value = {
        x: translationX,
        y: translationY,
      };
    })
    .onEnd(() => {
      position.value = withSpring({ x: 0, y: 0 });

      if (position.value.x > width * 0.35) {
        position.value = withSpring(
          { x: width + 100, y: 100 },
          {
            duration: 250,
          }
        );

        runOnJS(likeCard)();
      } else if (position.value.x < -width * 0.35) {
        position.value = withSpring(
          { x: -width - 100, y: 100 },
          {
            duration: 250,
          }
        );

        runOnJS(removeCard)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      position.value.x,
      [-width * 0.3, width * 0.3],
      [-10, 10],
      Extrapolation.CLAMP
    );

    return {
      zIndex: length - index,
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
        { rotate: `${rotate}deg` },
      ],
    };
  }, []);

  return (
    <GestureDetector gesture={moveGesture}>
      <Animated.View style={[animatedStyle]}>
        <Card
          style={{
            position: "absolute",
            left: width * 0.05,
            top: height * 0.15,
            transform: [
              { translateY: index * 30 },
              {
                scale: 1 - index * 0.05,
              },
            ],
          }}
        >
          <Poster card={card} />

          <Content {...card} />
        </Card>
      </Animated.View>
    </GestureDetector>
  );
};
