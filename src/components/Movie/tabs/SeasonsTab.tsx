import { StyleSheet, View, ScrollView } from "react-native";
import Seasons from "../SeasonsList";
import { memo } from "react";

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
    paddingHorizontal: 15,
    minHeight: 400,
  },
});
