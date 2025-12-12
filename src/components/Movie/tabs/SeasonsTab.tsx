import { StyleSheet, View, ScrollView } from "react-native";
import Seasons from "../SeasonsList";
import { memo } from "react";

interface SeasonsTabProps {
  id: number;
  seasons: any[];
}

function SeasonsTab({ id, seasons }: SeasonsTabProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
      <Seasons id={id} seasons={seasons} />
    </ScrollView>
  );
}

export default memo(SeasonsTab);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
