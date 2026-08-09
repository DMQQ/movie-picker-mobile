import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import Text from "./Text";
import { colors, fontWeight, fontSize, radius, spacing} from "../constants/design";

import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as StoreReview from "expo-store-review";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReviewManager from "../utils/rate";
import useTranslation from "../service/useTranslation";

interface RateAppPillProps {
  onDismiss: () => void;
}

export default function RateAppPill({ onDismiss }: RateAppPillProps) {
  const t = useTranslation();

  const handlePress = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      if (Platform.OS !== "web" && (await StoreReview.hasAction())) {
        await StoreReview.requestReview();
        await ReviewManager.recordReviewRequestFromRating();
      }
    } catch (error) {
      console.error("Error requesting store review:", error);
    }

    onDismiss();
  };

  const handleDismiss = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss();
  };

  return (
    <Animated.View style={styles.container} entering={FadeInUp} exiting={FadeOutUp}>
      <TouchableOpacity style={styles.pill} onPress={handlePress} activeOpacity={0.8}>
        <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
        <Text style={styles.text}>{t("rate-app.prompt")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
        <MaterialCommunityIcons name="close" size={14} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  text: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  closeButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs + 2,
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
});
