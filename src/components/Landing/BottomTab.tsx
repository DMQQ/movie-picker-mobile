import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { memo, PropsWithChildren } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import PlatformBlurView from "../PlatformBlurView";

const BottomTabContainer = ({ children }: PropsWithChildren<{}>) => {
  return (
    <PlatformBlurView isInteractive style={[{ flexDirection: "row", overflow: "hidden" }, tabStyles.container]}>
      {children}
    </PlatformBlurView>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    left: 15,
    right: 15,
    bottom: 15,
    backgroundColor: Platform.OS === "android" ? "#000" : "transparent",
    padding: 15,
    borderRadius: 100,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    height: "100%",
  },
  buttonLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.5,
    marginTop: 5,
  },
});

const BottomTab = memo(
  () => {
    const t = useTranslation();
    const navigation = useNavigation<any>();

    const withTouch = (fn: () => void) => {
      return () => {
        if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        fn();
      };
    };

    return (
      <BottomTabContainer>
        <TouchableOpacity activeOpacity={0.8} style={tabStyles.button} onPress={withTouch(() => navigation.navigate("Favourites"))}>
          <>
            <FontAwesome name="bookmark" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.favourites")}</Text>
          </>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[tabStyles.button]}
          onPress={withTouch(() =>
            navigation.navigate("QRCode", {
              screen: "QRScanner",
            })
          )}
        >
          <>
            <FontAwesome name="qrcode" size={30} color={"#fff"} />
            <Text style={[tabStyles.buttonLabel, { color: "#fff" }]}>{t("tabBar.join-game")}</Text>
          </>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={tabStyles.button} onPress={withTouch(() => navigation.navigate("Games"))}>
          <>
            <FontAwesome name="gamepad" size={25} color="#fff" />
            <Text style={tabStyles.buttonLabel}>{t("tabBar.games")}</Text>
          </>
        </TouchableOpacity>
      </BottomTabContainer>
    );
  },
  () => true
);

export default BottomTab;
