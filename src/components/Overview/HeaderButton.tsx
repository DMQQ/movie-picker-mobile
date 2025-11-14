import { useContext } from "react";
import { Button } from "react-native-paper";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import { router } from "expo-router";

export default function HeaderButton({ room }: { room: string }) {
  const { socket } = useContext(SocketContext);

  const t = useTranslation();

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
            router.push({
              pathname: "/overview",
              params: {
                roomId: room,
                matches: JSON.stringify(matches),
              },
            });
          }
        );
      }}
    >
      {t("match.view-matches")}
    </Button>
  );
}
