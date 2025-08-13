import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeOut, ZoomOut } from "react-native-reanimated";

const AppLoadingOverlay = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <Animated.View exiting={FadeOut.delay(150)} style={styles.overlay}>
      <View style={styles.loaderContainer}>
        <Animated.Image
          exiting={ZoomOut}
          source={require("../../assets/images/icon-light.png")}
          style={{ width: 200, height: 200, marginBottom: 20 }}
        />
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
