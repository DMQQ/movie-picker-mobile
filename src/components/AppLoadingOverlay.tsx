import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";

const AppLoadingOverlay = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHiding(true);
      setTimeout(() => setIsLoading(false), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <Animated.View exiting={FadeOut} style={styles.overlay}>
      <View style={styles.loaderContainer}>
        <Image source={require("../../assets/images/icon-light.png")} style={{ width: 200, height: 200, marginBottom: 20 }} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 100,
    height: 100,
  },
  circle: {
    position: "absolute",
    borderRadius: 50,
    borderWidth: 4,
    width: "100%",
    height: "100%",
  },
  circle1: {
    borderColor: "#7845ac",
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
  },
  circle2: {
    borderColor: "#ca469c",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    width: "75%",
    height: "75%",
  },
  circle3: {
    borderColor: "#fd5f80",
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
    width: "50%",
    height: "50%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 9999,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppLoadingOverlay;
