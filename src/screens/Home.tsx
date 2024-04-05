import { useEffect, useState } from "react";
import { Image, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Button, Card, Text, useTheme } from "react-native-paper";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { socket } from "../service/socket";

const _cards = ["1", "2", "3"];

export default function Home({ route, navigation }: any) {
  const [cards, setCards] = useState(_cards);
  const room = route.params?.roomId;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => {
            socket.emit("reset-room", room);
          }}
        >
          RESET
        </Button>
      ),
    });
  }, []);

  useEffect(() => {
    socket.emit("join-room", room);

    socket.on("movies", (cards) => {
      setCards(cards.movies);
    });

    socket.on("room-deleted", () => {
      navigation.goBack();
    });

    socket.on("movies", () => {});

    return () => {
      socket.off("room-joined");
      socket.off("movies");
      socket.emit("leave-room", room);
      socket.off("room-deleted");
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {cards.map((card, index) => (
        <Tile
          key={card}
          card={card}
          index={index}
          filterCard={() => {
            // setCards(cards.filter((c, i) => i !== index));

            socket.emit("filter-movies", room, index);
          }}
        />
      ))}
    </View>
  );
}

const Tile = ({
  card,
  index,
  filterCard,
}: {
  card: string;
  index: number;
  filterCard: () => void;
}) => {
  const { width, height } = useWindowDimensions();
  const theme = useTheme();

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

      if (position.value.x > width * 0.5 || position.value.x < -width * 0.5) {
        //runOnJS(filterCard)()

        position.value = withSpring(
          { x: width + 100, y: 100 },
          {
            duration: 250,
          }
        );

        runOnJS(filterCard)();
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
      zIndex: _cards.length - index,
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
            width: width * 0.9,
            height: height * 0.65,
            position: "absolute",
            backgroundColor: theme.colors.surface,
            borderRadius: 25,
            left: width * 0.05,
            top: height * 0.15,
            padding: 10,
            borderWidth: 1,
            borderColor: "#1F1F1F",

            transform: [
              { translateY: index * 25 },
              {
                scale: 1 - index * 0.07,
              },
            ],
          }}
        >
          <Image
            style={{
              height: height * 0.3,
              width: width * 0.9 - 20,
              borderRadius: 19,
            }}
            source={{
              uri: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9yZXN0fGVufDB8fDB8fHww",
            }}
          />

          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>{card}</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deleniti
              sed eligendi est laudantium exercitationem nesciunt perferendis!
              Beatae eaque itaque
            </Text>
          </View>
        </Card>
      </Animated.View>
    </GestureDetector>
  );
};
