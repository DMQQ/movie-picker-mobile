import { MaterialCommunityIcons } from "@expo/vector-icons";
import IconButton from "./IconButton";
import PlatformBlurView from "./PlatformBlurView";
import { colors, common, radius } from "../constants/design";
import { StyleSheet } from "react-native";

interface HeaderActionButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  size?: number;
}

export default function HeaderActionButton({
  icon,
  onPress,
  size = 28,
}: HeaderActionButtonProps) {
  return (
    <PlatformBlurView interactive style={styles.container}>
      <IconButton
        icon={icon}
        size={size}
        style={common.iconButton}
        iconColor={colors.text}
        onPress={onPress}
      />
    </PlatformBlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
});
