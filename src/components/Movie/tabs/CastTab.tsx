import { StyleSheet, View } from "react-native";
import Cast from "../Cast";
import { memo } from "react";
import { spacing } from "../../../constants/design";

interface CastTabProps {
  id: number;
  type: "movie" | "tv";
  initialData?: any;
}

function CastTab({ id, type, initialData }: CastTabProps) {
  return (
    <View style={styles.container}>
      <Cast id={id} type={type} initialData={initialData} />
    </View>
  );
}

export default memo(CastTab);

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm + 2,
    paddingHorizontal: spacing.screen,
  },
});
