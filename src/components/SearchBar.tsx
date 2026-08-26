import { useNavigation } from "expo-router";
import IconButton from "./IconButton";
import { BlurView } from "expo-blur";
import { StyleSheet, TextInput, View } from "react-native";

import { colors, fontSize, radius, spacing } from "../constants/design";
import Animated, { FadeInUp } from "react-native-reanimated";
import PlatformBlurView from "./PlatformBlurView";
import useTranslation from "../service/useTranslation";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const CustomSearchBar = ({ value, onChangeText, placeholder }: SearchBarProps) => {
  const navigation = useNavigation();
  const t = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("common.search-placeholder");

  return (
    <Animated.View style={{ paddingHorizontal: spacing.screen }} entering={FadeInUp}>
      <View style={styles.container}>
        <PlatformBlurView style={styles.searchContainer} intensity={5}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={28} style={styles.backButton} />

          <TextInput
            placeholder={resolvedPlaceholder}
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
    marginBottom: spacing.screen,
    borderRadius: radius.pill,
    overflow: "hidden",
    borderWidth: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs + 1,
  },
  backButton: {
    margin: 0,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    paddingHorizontal: spacing.sm,
    height: "100%",
  },
  clearButton: {
    margin: 0,
  },
});

export default CustomSearchBar;
