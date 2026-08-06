import { StyleSheet, View, ScrollView } from "react-native";
import Seasons from "../SeasonsList";
import { memo } from "react";
import { spacing } from "../../../constants/design";

interface SeasonsTabProps {
  id: number;
  seasons: any[];
}

function SeasonsTab({ id, seasons }: SeasonsTabProps) {
  return (
    <View style={styles.container}>
      <Seasons id={id} seasons={seasons} />
    </View>
  );
}

export default memo(SeasonsTab);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    minHeight: 400,
  },
});
