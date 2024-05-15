import * as React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { MD3DarkTheme, useTheme } from "react-native-paper";

interface SkeletonProps {
  children: React.ReactElement;
}

const dims = Dimensions.get("screen");

const Skeleton = ({ children }: SkeletonProps) => {
  const shared = useSharedValue(0);

  const { width, height } = children.props.style;

  React.useEffect(() => {
    shared.value = withRepeat(withTiming(1, { duration: 1000 }), Infinity);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shared.value, [0, 1], [-width, width]),
      },
    ],
  }));

  const theme = useTheme();

  return (
    <Reanimated.View style={{ width, height }}>
      <MaskedView
        androidRenderingMode="software"
        maskElement={children}
        style={{
          width,
          height,
        }}
      >
        <View
          style={[styles.background, { backgroundColor: theme.colors.surface }]}
        />
        <Reanimated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
                colors={["transparent", "black", "transparent"]}
              />
            }
          >
            <Reanimated.View
              entering={FadeIn}
              exiting={FadeOut}
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: "#000",
                },
              ]}
            />
          </MaskedView>
        </Reanimated.View>
      </MaskedView>
    </Reanimated.View>
  );
};

interface ItemProps {
  width: number;
  height: number;
}

Skeleton.Item = ({ width, height }: ItemProps) => (
  <Reanimated.View
    style={[
      styles.item,
      {
        width,
        height,
      },
    ]}
  />
);

const styles = StyleSheet.create({
  background: {
    flexGrow: 1,
    overflow: "hidden",
  },
  item: {
    marginTop: 10,
    backgroundColor: "#333",
    borderRadius: 5,
  },
});

export default Skeleton;
