import { DarkTheme } from "@react-navigation/native";
import { Button, Modal, Portal, Text, useTheme } from "react-native-paper";
import Card from "./Card";
import Poster from "./Poster";
import { Dimensions, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const styles = StyleSheet.create({
  matchModal: {
    padding: 20,
    borderRadius: 20,
  },
  matchText: {
    fontSize: 40,
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

export default function MatchModal({
  match,
  hideMatchModal,
}: {
  match: any;
  hideMatchModal: any;
}) {
  const theme = useTheme();

  return (
    <Portal theme={DarkTheme}>
      <Modal
        dismissable
        dismissableBackButton
        visible={typeof match !== "undefined"}
        onDismiss={hideMatchModal}
        style={styles.matchModal}
      >
        <Text
          style={[
            styles.matchText,
            {
              color: "#fff",
              transform: [{ translateY: -15 }],
            },
          ]}
        >
          It's a match!
        </Text>

        {typeof match !== "undefined" && (
          <Card
            onPress={hideMatchModal}
            style={{
              transform: [{ translateY: -10 }],
            }}
          >
            <LinearGradient
              colors={["transparent", "transparent", theme.colors.primary]}
              style={styles.gradient}
            >
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
                {match.release_date || match.first_air_date},{" "}
                {match.vote_average.toFixed(1)}/10
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
        )}
      </Modal>
    </Portal>
  );
}
