import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Feather from "@expo/vector-icons/Feather";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { url } from "../context/SocketContext";

export default function NoConnectionError() {
  const isConnected = useNetInfo().isConnected;
  const [isServerOkay, setIsServerOkay] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const checkServer = async () => {
      try {
        const response = await fetch(url + "/health");

        setIsServerOkay(response.ok);
      } catch {}
    };

    checkServer();

    return () => {
      abortController.abort();
    };
  }, [isConnected]);

  if (isServerOkay) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Feather name="wifi-off" size={45} color="#fff" />
      <Text style={styles.text}>No connection available.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  text: { color: "#fff", fontSize: 16, marginTop: 10 },
});
