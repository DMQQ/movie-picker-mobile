import { Dimensions, StyleSheet, View } from "react-native";
import Skeleton from "../Skeleton/Skeleton";
import { useTheme } from "react-native-paper";
import { getConstrainedDimensions } from "../../utils/getConstrainedDimensions";

const { width, height } = getConstrainedDimensions("screen");

const styles = StyleSheet.create({
  container: {
    width,
    backgroundColor: "#000",
    borderTopEndRadius: 25,
    borderTopStartRadius: 25,
    padding: 20,
  },
  title: {
    width: width / 2,
    height: 30,
    borderRadius: 5,
    backgroundColor: "#000",
    marginBottom: 10,
  },
  title2: {
    width: width - 30,
    marginBottom: 30,
  },
  subTitle: {
    width: width - 30,
    height: 25,
    borderRadius: 5,
    backgroundColor: "#000",
    marginBottom: 10,
  },

  subContainer: {
    width: width - 30,
    height: height,
    marginTop: 15,
    zIndex: 1,
  },

  overview: {
    width: width - 30,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#000",
    marginBottom: 20,
  },
});

export default function MovieDetailsSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton>
        <View style={styles.subContainer}>
          <View style={styles.title} />
          <View style={[styles.title, styles.title2]} />

          <View style={styles.subTitle} />
          <View style={styles.subTitle} />
          <View style={styles.subTitle} />
          <View style={styles.subTitle} />
          <View style={styles.subTitle} />
          <View style={[styles.subTitle, { marginBottom: 30 }]} />

          <View style={styles.overview} />

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 30 }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <View
                key={item}
                style={{
                  width: 50,
                  backgroundColor: "#000",
                  height: 50,
                  borderRadius: 10,
                }}
              />
            ))}
          </View>

          <View style={styles.subTitle} />
          <View style={[styles.subTitle, { marginBottom: 30 }]} />

          <View style={styles.overview} />
        </View>
      </Skeleton>
    </View>
  );
}
