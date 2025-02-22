import { View } from "react-native";
import { Text } from "react-native-paper";
import Feather from "@expo/vector-icons/Feather";
import { useNetInfo } from "@react-native-community/netinfo";

export default function NoConnectionError() {
  const isConnected = useNetInfo().isConnected;

  if (isConnected) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <Feather name="wifi-off" size={45} color="#fff" />
      <Text style={{ color: "#fff", fontSize: 16, marginTop: 10 }}>No connection available.</Text>
    </View>
  );
}
