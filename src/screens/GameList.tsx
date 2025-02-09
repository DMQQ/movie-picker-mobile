import { Dimensions, Image, View } from "react-native";
import SafeIOSContainer from "../components/SafeIOSContainer";
import { IconButton, MD2DarkTheme, Text, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import useTranslation from "../service/useTranslation";

export default function GameList() {
  const navigation = useNavigation<any>();

  const t = useTranslation();

  return (
    <SafeIOSContainer>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={35} />

        <Text style={{ fontFamily: "Bebas", fontSize: 40, textAlign: "center", width: "70%", color: "#fff" }}>{t("voter.games")}</Text>
      </View>

      <View style={{ flex: 1, padding: 15 }}>
        <TouchableRipple
          onPress={() => {
            navigation.navigate("QRCode");
          }}
          style={{
            marginBottom: 45,
          }}
        >
          <View>
            <View style={{ flexDirection: "row" }}>
              <Image
                borderRadius={10}
                source={require("../assets/qr2.png")}
                style={{ width: (Dimensions.get("screen").width - 40) / 2, height: 280, marginRight: 10 }}
              />
              <Image
                borderRadius={10}
                source={require("../assets/qr1.png")}
                style={{ width: (Dimensions.get("screen").width - 40) / 2, height: 280, marginRight: 10 }}
              />
            </View>
            <Text style={{ fontFamily: "Bebas", fontSize: 30, textAlign: "center", color: "#fff", marginTop: 10 }}>{t("voter.swipe")}</Text>
          </View>
        </TouchableRipple>

        <TouchableRipple onPress={() => navigation.navigate("Voter", { screen: "Home" })} style={{}}>
          <View>
            <Image
              borderRadius={10}
              resizeMode="cover"
              source={require("../assets/voter1.png")}
              style={{ width: Dimensions.get("screen").width - 30, height: 250, marginBottom: 10 }}
            />
            <Text style={{ fontFamily: "Bebas", fontSize: 30, textAlign: "center", color: "#fff" }}>{t("voter.title")} (BETA)</Text>
          </View>
        </TouchableRipple>
      </View>
    </SafeIOSContainer>
  );
}
