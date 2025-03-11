import { useNavigation } from "@react-navigation/native";
import { Platform, PlatformColor, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

export default function PageHeading({ title, onPress }: { title: string; onPress?: () => void }) {
  const navigation = useNavigation();
  return (
    <View style={styles.headerTop}>
      <IconButton icon="chevron-left" onPress={onPress || (() => navigation.goBack())} size={28} style={styles.backButton} />
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
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  headerTitle: {
    fontFamily: "Bebas",
    fontSize: 32,
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginLeft: 20,
    marginRight: 20,
  },
  backButton: {
    marginRight: 8,
    position: "absolute",
    left: 8,
    zIndex: 1,
    top: Platform.OS === "android" ? 3 : 0,
  },
});
