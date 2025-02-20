import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export const FancySpinner = ({ size = 100, speed = 2000 }: { size?: number; speed?: number; dotSize?: number }) => {
  return (
    <View style={styles.container}>
      <LottieView
        style={{
          width: size,
          height: size,
        }}
        source={require("../../assets/spinner.json")}
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    position: "absolute",
  },
});
