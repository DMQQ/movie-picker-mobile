import { useMemo, useState } from "react";
import { Dimensions, Linking, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useGetTrailersQuery } from "../../redux/movie/movieApi";
import { hexToRgba } from "../../utils/hexToRgb";
import PlatformBlurView from "../PlatformBlurView";

const width = Dimensions.get("window").width;

const config = {
  damping: 20,
  stiffness: 200,
  mass: 0.9,
};

export default function Trailers({ id, type }: { id: number; type: string }) {
  const { data: trailers } = useGetTrailersQuery({ id: id, type: type });

  const [showItems, setShowItems] = useState(false);

  const isExpanded = useSharedValue(false);

  const filteredItems = useMemo(() => {
    return trailers?.filter((v) => v.site === "YouTube" && v.official) || [];
  }, [trailers]);

  const animatedValue = useAnimatedStyle(() => ({
    width: withSpring(isExpanded.value ? width / 2 : 115, config),
    height: withSpring(isExpanded.value ? filteredItems.length * 45 + 45 : 45, config),
  }));

  if (!filteredItems.length) return null;

  return (
    <Animated.View style={styles.container}>
      <PlatformBlurView
        style={{
          borderRadius: 15,
          marginright: 15,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            isExpanded.value = !isExpanded.value;
            setShowItems(!showItems);
          }}
        >
          <Animated.View style={[animatedValue, { position: "relative" }]}>
            {showItems && (
              <Animated.View entering={FadeInDown.delay(filteredItems.length > 3 ? 150 : 50)}>
                {filteredItems.map((trailer, index) => (
                  <Animated.View
                    key={trailer.key}
                    entering={FadeInDown.delay(index * 35)}
                    style={{
                      width: "100%",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
                      }}
                      style={styles.button}
                      activeOpacity={0.8}
                    >
                      <AntDesign name="youtube" size={24} color="#FF0000" />
                      <Text variant="bodyMedium" style={styles.mainButtonText} numberOfLines={1}>
                        {trailer.name || "Trailer"}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </Animated.View>
            )}
            <Animated.View style={[styles.buttonsContainer, { width: showItems ? width / 2 - 30 : 90 }]}>
              {!showItems && (
                <Animated.View entering={FadeInLeft} exiting={FadeOutLeft}>
                  <AntDesign name="youtube" size={24} color="#FF0000" />
                </Animated.View>
              )}
              <Text
                variant="bodyMedium"
                style={{
                  color: "white",
                  fontWeight: "bold",
                }}
                numberOfLines={2}
              >
                {showItems ? "Close" : "Trailers"}
              </Text>
              {showItems && (
                <Animated.View entering={FadeInRight} exiting={FadeOutRight}>
                  <AntDesign name="close" size={24} color="#FFF" />
                </Animated.View>
              )}
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </PlatformBlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", right: 15, bottom: 30 },
  button: {
    padding: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba("#FFFFFF", 0.2),
  },
  mainButtonText: {
    color: "white",
    fontWeight: "bold",
    width: width / 2 - 50,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "absolute",
    bottom: 10,
    left: 15,
    justifyContent: "space-between",
  },
});
