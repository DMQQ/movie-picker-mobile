import { useNavigation } from "expo-router";
import { BlurView } from "expo-blur";
import { StyleSheet, TextInput, View } from "react-native";
import { IconButton } from "react-native-paper";
import { colors } from "../constants/design";
import Animated, { FadeInUp } from "react-native-reanimated";
import PlatformBlurView from "./PlatformBlurView";

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
        <PlatformBlurView style={styles.searchContainer} intensity={5}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} style={styles.backButton} />

          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
            selectionColor={colors.primary}
          />

          {value.length > 0 && (
            <IconButton icon="close" size={20} iconColor="#666" onPress={() => onChangeText("")} style={styles.clearButton} />
          )}
        </PlatformBlurView>
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    paddingHorizontal: 5,
  },
  backButton: {
    margin: 0,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: fontSize.lg,
    paddingHorizontal: 8,
    height: "100%",
  },
  clearButton: {
    margin: 0,
  },
});

export default CustomSearchBar;
