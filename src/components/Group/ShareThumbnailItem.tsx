import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Checkbox from "../Checkbox";

import Thumbnail from "../Thumbnail";
import { colors, radius} from "../../constants/design";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ShareThumbnailItemProps {
  imageUrl: string;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

export default function ShareThumbnailItem({
  imageUrl,
  isSelected,
  isDisabled,
  onPress,
}: ShareThumbnailItemProps) {
  return (
    <Pressable onPress={onPress} style={[styles.container, isDisabled && styles.disabled]}>
      <Thumbnail
        size={185}
        path={imageUrl}
        container={{ width: "100%", height: "100%", borderRadius: radius.sm }}
        style={{ width: "100%", height: "100%", borderRadius: radius.sm }}
      />
      <View style={[styles.checkboxOverlay, isSelected && styles.checkboxSelected]}>
        <Checkbox
          status={isSelected ? "checked" : "unchecked"}
          color={colors.text}
          uncheckedColor="rgba(255,255,255,0.7)"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: (SCREEN_WIDTH - 90) / 3,
    aspectRatio: 2 / 3,
    borderRadius: radius.sm,
    overflow: "hidden",
    position: "relative",
  },
  disabled: { opacity: 0.4 },
  checkboxOverlay: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: radius.pill,
  },
  checkboxSelected: { backgroundColor: "rgba(103, 80, 164, 0.8)" },
});
