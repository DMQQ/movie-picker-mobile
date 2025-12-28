import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { memo, PropsWithChildren } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import useTranslation from "../../service/useTranslation";
import PlatformBlurView from "../PlatformBlurView";
import { LinearGradient } from "expo-linear-gradient";

const BottomTabContainer = ({ children }: PropsWithChildren<{}>) => {
  return (
    <PlatformBlurView isInteractive style={[{ flexDirection: "row" }, tabStyles.container]}>
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

    zIndex: 1000,

    ...Platform.select({
      ios: {
        left: 15,
        right: 15,
        bottom: 15,
        borderRadius: 1000,
        padding: 15,
      },
      android: {
        backgroundColor: "#111111",
        bottom: 0,
        padding: 15,
        paddingBottom: 40,
        paddingTop: 20,
        borderWidth: 2,
        borderColor: "#343434ff",
        borderRadius: 25,
        borderTopRightRadius: 35,
        borderTopLeftRadius: 35,
        overflow: "hidden",
      },
    }),
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

    const withTouch = (fn: () => void) => {
      return () => {
        if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        fn();
      };
    };

    return (
      <>
        {Platform.OS === "ios" && (
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)", "#000"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, zIndex: 90 }}
            pointerEvents="none"
          />
        )}
        <BottomTabContainer>
          <TouchableOpacity activeOpacity={0.8} style={tabStyles.button} onPress={withTouch(() => router.push("/favourites"))}>
            <>
              <FontAwesome name="bookmark" size={25} color="#fff" />
              <Text style={tabStyles.buttonLabel}>{t("tabBar.favourites")}</Text>
            </>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={[tabStyles.button]} onPress={withTouch(() => router.push("/qr-scanner"))}>
            <>
              <FontAwesome name="qrcode" size={25} color={"#fff"} />
              <Text style={[tabStyles.buttonLabel, { color: "#fff" }]}>{t("tabBar.join-game")}</Text>
            </>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={tabStyles.button} onPress={withTouch(() => router.push("/games"))}>
            <>
              <FontAwesome name="gamepad" size={25} color="#fff" />
              <Text style={tabStyles.buttonLabel}>{t("tabBar.games")}</Text>
            </>
          </TouchableOpacity>
        </BottomTabContainer>
      </>
    );
  },
  () => true
);

export default BottomTab;
