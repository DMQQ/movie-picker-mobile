import { StyleSheet, View } from "react-native";
import Cast from "../Cast";
import { memo } from "react";

interface CastTabProps {
  id: number;
  type: "movie" | "tv";
}

function CastTab({ id, type }: CastTabProps) {
  return (
    <View style={styles.container}>
      <Cast id={id} type={type} />
    </View>
  );
}

export default memo(CastTab);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
});
