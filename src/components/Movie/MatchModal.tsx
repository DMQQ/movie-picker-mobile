import { DarkTheme } from "@react-navigation/native";
import { Modal, Portal, Text, useTheme } from "react-native-paper";
import Card from "./Card";
import Poster from "./Poster";
import { Dimensions, Easing, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, ZoomIn, withSpring, withTiming } from "react-native-reanimated";

const styles = StyleSheet.create({
  matchModal: {
    padding: 20,
    borderRadius: 20,
  },
  matchText: {
    fontSize: 45,
    textAlign: "left",
    fontWeight: "900",
  },
  matchCard: {
    justifyContent: "flex-start",
    position: "relative",
    height: "auto",
    marginTop: 15,
    minHeight: Dimensions.get("screen").height / 1.5,
  },
  matchClose: {
    marginVertical: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  gradient: {
    overflow: "hidden",
    width: Dimensions.get("screen").width * 0.95 - 20,
    height: Dimensions.get("screen").height * 0.7,
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 10,
    padding: 10,
    paddingBottom: 20,

    borderBottomRightRadius: 19,
    borderBottomLeftRadius: 19,
  },
  details: {
    color: "white",
    paddingHorizontal: 10,
    fontWeight: "bold",
    marginTop: 5,
  },
});

const CustomEnteringTransition = () => {
  "worklet";

  return {
    initialValues: {
      opacity: 0,
      transform: [{ scale: 0.8 }],
      left: 200,
    },
    animations: {
      opacity: withTiming(1, { duration: 200 }),
      transform: [{ scale: withTiming(1, { duration: 200 }) }],
      left: withTiming(0, { duration: 200 }),
    },
  };
};

export default function MatchModal({ match, hideMatchModal }: { match: any; hideMatchModal: any }) {
  const theme = useTheme();

  return (
    <Portal theme={DarkTheme}>
      <Modal dismissable dismissableBackButton visible={typeof match !== "undefined"} onDismiss={hideMatchModal} style={styles.matchModal}>
        <Animated.Text
          entering={FadeIn.delay(200)}
          style={[
            styles.matchText,
            {
              color: "#fff",
              transform: [{ translateY: -25 }],
            },
          ]}
        >
          It's a match!
        </Animated.Text>

        {typeof match !== "undefined" && (
          <Animated.View entering={CustomEnteringTransition}>
            <Card
              onPress={hideMatchModal}
              style={{
                transform: [{ translateY: -10 }],
              }}
            >
              <LinearGradient colors={["transparent", "transparent", theme.colors.primary]} style={styles.gradient}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 25,
                    paddingHorizontal: 10,
                    fontWeight: "bold",
                  }}
                >
                  {match.title || match.name}
                </Text>

                <Text style={styles.details}>
                  {match.release_date || match.first_air_date}, {match.vote_average.toFixed(1)}/10
                </Text>
              </LinearGradient>

              <Poster
                imageDimensions={{
                  width: Dimensions.get("screen").width * 0.95 - 20,
                  height: Dimensions.get("screen").height * 0.7,
                }}
                card={match}
              />
            </Card>
          </Animated.View>
        )}
      </Modal>
    </Portal>
  );
}
