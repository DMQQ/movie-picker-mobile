import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

export default function PageHeading({ title }: { title: string }) {
  const navigation = useNavigation();
  return (
    <View style={styles.headerTop}>
      <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} style={styles.backButton} />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    position: "relative",
  },
  headerTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginLeft: 40,
    marginRight: 40,
  },
  backButton: {
    marginRight: 8,
    position: "absolute",
    left: 8,
    zIndex: 1,
  },
});
