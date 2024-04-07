import { useContext } from "react";
import { Button } from "react-native-paper";
import { SocketContext } from "../../service/SocketContext";

export default function HeaderButton({
  navigation,
  room,
}: {
  navigation: any;
  room: string;
}) {
  const { socket } = useContext(SocketContext);

  return (
    <Button
      onPress={() => {
        socket?.emit("get-overview", room);
        socket?.on(
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
