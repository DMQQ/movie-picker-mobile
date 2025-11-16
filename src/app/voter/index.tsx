import { View } from "react-native";
import Home from "../../screens/Voter/Home";
import { SocketProvider } from "../../context/SocketContext";
import { MovieVoterProvider } from "../../service/useVoter";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoterPage() {
  return (
    <SocketProvider namespace="/voter">
      <MovieVoterProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <Home />
        </SafeAreaView>
      </MovieVoterProvider>
    </SocketProvider>
  );
}
