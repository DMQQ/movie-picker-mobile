import { Image, View } from "react-native";
import { Text } from "react-native-paper";

export default function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <Image
        source={require("../../assets/images/icon-light.png")}
        style={{ width: 200, height: 200, marginBottom: 20 }}
      />
      <Text style={{ fontFamily: "Bebas", marginTop: 10, fontSize: 25 }}>
        Loading...
      </Text>
    </View>
  );
}
