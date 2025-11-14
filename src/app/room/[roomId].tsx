import { SocketProvider } from "../../service/SocketContext";
import Home from "../../screens/Room/Home";
import { RoomContextProvider } from "../../screens/Room/RoomContext";

export default function RoomSession() {
  return (
    <SocketProvider namespace="/swipe">
      <RoomContextProvider>
        <Home />
      </RoomContextProvider>
    </SocketProvider>
  );
}
