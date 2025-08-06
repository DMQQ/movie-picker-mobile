import { useNavigation } from "@react-navigation/native";
import { Platform, StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

export default function PageHeading({
  title,
  onPress,
  showBackButton = true,
}: {
  title: string;
  onPress?: () => void;
  showBackButton?: boolean;
}) {
  const navigation = useNavigation();
  return (
    <View style={styles.headerTop}>
      {showBackButton && (
        <IconButton icon="chevron-left" onPress={onPress || (() => navigation.goBack())} size={28} style={styles.backButton} />
      )}
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
    paddingTop: 10,
  },
  backButton: {
    marginRight: 8,
    position: "absolute",
    left: 8,
    zIndex: 1,
    top: Platform.OS === "android" ? 3 : 0,
  },
});
