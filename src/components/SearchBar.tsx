import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { StyleSheet, TextInput, View } from "react-native";
import { IconButton, MD2DarkTheme } from "react-native-paper";
import Animated, { FadeInUp } from "react-native-reanimated";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const CustomSearchBar = ({ value, onChangeText, placeholder = "Search movies and TV shows..." }: SearchBarProps) => {
  const navigation = useNavigation();

  return (
    <Animated.View style={{ paddingHorizontal: 15 }} entering={FadeInUp}>
      <View style={styles.container}>
        <BlurView style={styles.searchContainer} intensity={5}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} style={styles.backButton} />

          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
            selectionColor={MD2DarkTheme.colors.primary}
          />

          {value.length > 0 && (
            <IconButton icon="close" size={20} iconColor="#666" onPress={() => onChangeText("")} style={styles.clearButton} />
          )}
        </BlurView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    paddingHorizontal: 5,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  backButton: {
    margin: 0,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 8,
    height: "100%",
  },
  clearButton: {
    margin: 0,
  },
});

export default CustomSearchBar;
