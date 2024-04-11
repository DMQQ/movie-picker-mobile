import { View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Landing({ navigation }: any) {
  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ marginTop: 25, fontWeight: "bold", fontSize: 30 }}>
        Welcome to the app! This is the landing page. You can navigate to other
        screens using the buttons below
      </Text>

      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("QRCode")}
          style={{ borderRadius: 10 }}
          contentStyle={{ padding: 5 }}
        >
          Create Room
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("QRScanner")}
          style={{ marginTop: 15, borderRadius: 10 }}
          contentStyle={{ padding: 5 }}
        >
          Join Room
        </Button>
      </View>
    </View>
  );
}
