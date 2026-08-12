import { Platform, View } from "react-native";
import Home from "../../screens/Voter/Home";
import { SocketProvider } from "../../context/SocketContext";
import { MovieVoterProvider } from "../../service/useVoter";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/design";

export default function VoterPage() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.appBackground,
        paddingTop: insets.top,
        paddingBottom: Platform.OS === "android" ? insets.bottom : 0,
      }}
    >
      <SocketProvider namespace="/voter">
        <MovieVoterProvider>
          <Home />
        </MovieVoterProvider>
      </SocketProvider>
    </View>
  );
}
