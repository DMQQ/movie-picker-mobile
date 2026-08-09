import { Image, View } from "react-native";
import Text from "../components/Text";

import { colors, spacing} from "../constants/design";

export default function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.appBackground,
      }}
    >
      <Image
        source={require("../../assets/images/icon-light.png")}
        style={{ width: 200, height: 200, marginBottom: spacing.xl }}
      />
      <Text style={{ fontFamily: "Bebas", marginTop: spacing.sm + 2, fontSize: 25 }}>
        Loading...
      </Text>
    </View>
  );
}
