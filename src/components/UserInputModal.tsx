import { ReactNode } from "react";
import Text from "./Text";
import { ActivityIndicator, View, StyleSheet, Modal, Dimensions, Platform } from "react-native";

import Button from "./Button";
import PrimaryButton from "./PrimaryButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import PlatformBlurView from "./PlatformBlurView";
import { colors, fontSize, radius, spacing} from "../constants/design";

export interface UserInputModalAction {
  label: string;
  onPress: () => void;
  mode?: "text" | "outlined" | "contained";
  loading?: boolean;
  disabled?: boolean;
  textColor?: string;
}

interface UserInputModalProps {
  visible: boolean;
  onDismiss?: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: UserInputModalAction[];
  dismissable?: boolean;
  statusBarTranslucent?: boolean;
  width?: number;
  maxHeight?: string;
  enableHaptics?: boolean;
  actionsLayout?: "vertical" | "horizontal";
}

export default function UserInputModal({
  visible,
  onDismiss,
  title,
  subtitle,
  children,
  actions = [],
  dismissable = false,
  statusBarTranslucent = true,
  width = Dimensions.get("window").width - 30,
  maxHeight = "80%",
  enableHaptics = true,
  actionsLayout = "vertical",
}: UserInputModalProps) {
  const handleActionPress = (action: UserInputModalAction) => {
    if (enableHaptics && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action.onPress();
  };

  const handleBackdropPress = () => {
    if (dismissable && onDismiss) {
      if (enableHaptics && Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={statusBarTranslucent}
      onRequestClose={dismissable ? onDismiss : undefined}
    >
      <View style={styles.modalOverlay} onTouchEnd={handleBackdropPress}>
        <PlatformBlurView style={[styles.modalContent, { width, maxHeight }]} onTouchEnd={(e) => e.stopPropagation()}>
          <Animated.View style={[styles.modalInner]}>
            <Text style={styles.modalTitle}>{title}</Text>
            {subtitle && <Text style={styles.modalSubtitle}>{subtitle}</Text>}

            {children && <View style={styles.contentContainer}>{children}</View>}

            {actions.length > 0 && (
              <View style={[styles.actionsContainer, actionsLayout === "horizontal" && styles.actionsContainerHorizontal]}>
                {actions.map((action, index) => {
                  const mode = action.mode || "contained";
                  if (mode === "contained") {
                    return (
                      <PrimaryButton
                        key={index}
                        onPress={() => handleActionPress(action)}
                        disabled={action.disabled || action.loading}
                        loading={action.loading}
                        textColor={action.textColor}
                        style={[styles.actionButton, actionsLayout === "horizontal" && styles.actionButtonHorizontal]}
                      >
                        {action.label}
                      </PrimaryButton>
                    );
                  }
                  return (
                    <Button
                      key={index}
                      mode={mode}
                      onPress={() => handleActionPress(action)}
                      disabled={action.disabled || action.loading}
                      icon={action.loading ? ({ color }) => <ActivityIndicator size={16} color={color} /> : undefined}
                      textColor={action.textColor}
                      style={[styles.actionButton, actionsLayout === "horizontal" && styles.actionButtonHorizontal]}
                      contentStyle={styles.actionButtonContent}
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </View>
            )}
          </Animated.View>
        </PlatformBlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    borderRadius: 35,
    overflow: "hidden",
    flex: 0,
    ...Platform.select({
      android: {
        backgroundColor: colors.appBackground,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.18)",
      },
    }),
  },
  modalInner: {
    padding: spacing.xxl + 6,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 32,
    fontFamily: "Bebas",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: 1.2,
  },
  modalSubtitle: {
    fontSize: fontSize.md,
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 20,
    paddingHorizontal: spacing.sm + 2,
  },
  contentContainer: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  actionsContainer: {
    width: "100%",
    gap: spacing.sm + 2,
  },
  actionsContainerHorizontal: {
    flexDirection: "row",
  },
  actionButton: {
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  actionButtonHorizontal: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
  },
});
