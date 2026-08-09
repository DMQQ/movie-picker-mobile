import { StyleSheet, View } from "react-native";
import Text from "./Text";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { url } from "../context/SocketContext";
import { colors, fontSize, spacing} from "../constants/design";

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
      <MaterialCommunityIcons name="wifi-off" size={45} color={colors.text} />
      <Text style={styles.text}>No connection available.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.appBackground,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  text: { color: colors.text, fontSize: fontSize.lg, marginTop: spacing.sm + 2 },
});
