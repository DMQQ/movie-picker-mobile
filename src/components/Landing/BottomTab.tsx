import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { memo } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { MD2DarkTheme, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useTranslation from "../../service/useTranslation";

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Platform.OS === "android" ? "#000" : "transparent",
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    height: "100%",
  },
  buttonLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.5,
    marginTop: 5,
  },
});

const BottomTab = memo(
  () => {
    const t = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const withTouch = (fn: () => void) => {
      return () => {
        if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        fn();
      };
    };

    return (
      <BlurView
        intensity={Platform.OS === "ios" ? 60 : 100}
        tint="dark"
        style={[{ flexDirection: "row", paddingBottom: insets.bottom, paddingTop: 10 }, tabStyles.container]}
      >
        <TouchableOpacity activeOpacity={0.8} style={tabStyles.button} onPress={withTouch(() => navigation.navigate("Favourites"))}>
          <>
            <FontAwesome name="bookmark" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.favourites")}</Text>
          </>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            tabStyles.button,
            { backgroundColor: MD2DarkTheme.colors.primary, borderRadius: 10, padding: 5, paddingVertical: 10, maxWidth: 70 },
          ]}
          onPress={withTouch(() =>
            navigation.navigate("QRCode", {
              screen: "QRScanner",
            })
          )}
        >
          <>
            <FontAwesome name="qrcode" size={30} color={"#fff"} />
            {/* <Text style={[tabStyles.buttonLabel, { color: "#fff" }]}>{t("tabBar.join-game")}</Text> */}
          </>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={tabStyles.button} onPress={withTouch(() => navigation.navigate("Games"))}>
          <>
            <FontAwesome name="gamepad" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.games")}</Text>
          </>
        </TouchableOpacity>
      </BlurView>
    );
  },
  () => true
);

export default BottomTab;
