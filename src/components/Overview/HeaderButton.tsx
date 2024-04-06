import { Button } from "react-native-paper";
import { socket } from "../../service/socket";

export default function HeaderButton({
  navigation,
  room,
}: {
  navigation: any;
  room: string;
}) {
  return (
    <Button
      onPress={() => {
        socket.emit("get-overview", room);
        socket.on(
          "overview",
          (
            matches: {
              id: number;
              title?: string;
              name?: string;
            }[]
          ) => {
            navigation.navigate("Overview", {
              roomId: room,
              matches,
            });
          }
        );
      }}
    >
      View Matches
    </Button>
  );
}
