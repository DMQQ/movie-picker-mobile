import { View } from "react-native";
import Home from "../../screens/Voter/Home";
import { SocketProvider } from "../../context/SocketContext";
import { MovieVoterProvider } from "../../service/useVoter";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VoterPage() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <SocketProvider namespace="/voter">
        <MovieVoterProvider>
          <Home />
        </MovieVoterProvider>
      </SocketProvider>
    </View>
  );
}
