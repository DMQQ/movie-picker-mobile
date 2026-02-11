import * as Haptics from "expo-haptics";
import { Platform, StyleSheet } from "react-native";
import { IconButton, Text } from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";
import PlatformBlurView from "./PlatformBlurView";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { PropsWithChildren } from "react";

const LandingHeader = ({ children }: PropsWithChildren) => {
  const insets = useSafeAreaInsets();

  const nickname = useAppSelector((state) => state.room.nickname);
  const t = useTranslation();

  return (
    <>
      <LinearGradient
        colors={["#000", "rgba(0,0,0,0.6)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 220, zIndex: 90 }}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.container,
          {
            padding: 15,
            paddingTop: insets.top,
          },
        ]}
        entering={FadeInUp}
      >
        {children}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  mainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helloContainer: {
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  helloText: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "Bebas",
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 45,
    height: 45,
  },
  buttonBlur: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  iconButton: {
    margin: 0,
    width: 40,
    height: 45,
  },
  chipsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  chipWrapper: {
    marginRight: 10,
    borderRadius: 100,
    overflow: "hidden",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {},
  chipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default LandingHeader;
