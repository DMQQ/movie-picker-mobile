import { ReactNode } from "react";
import { View, StyleSheet, Modal, Dimensions, Platform } from "react-native";
import { Text, Button } from "react-native-paper";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import PlatformBlurView from "./PlatformBlurView";

export interface UserInputModalAction {
  label: string;
  onPress: () => void;
  mode?: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
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
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    mode={action.mode || "contained"}
                    onPress={() => handleActionPress(action)}
                    disabled={action.disabled}
                    loading={action.loading}
                    textColor={action.textColor}
                    style={[styles.actionButton, actionsLayout === "horizontal" && styles.actionButtonHorizontal]}
                    contentStyle={styles.actionButtonContent}
                  >
                    {action.label}
                  </Button>
                ))}
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
    padding: 20,
  },
  modalContent: {
    borderRadius: 35,
    overflow: "hidden",
    flex: 0,
    ...Platform.select({
      android: {
        backgroundColor: "#000",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.18)",
      },
    }),
  },
  modalInner: {
    padding: 30,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 32,
    fontFamily: "Bebas",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  contentContainer: {
    width: "100%",
    marginBottom: 20,
  },
  actionsContainer: {
    width: "100%",
    gap: 10,
  },
  actionsContainerHorizontal: {
    flexDirection: "row",
  },
  actionButton: {
    borderRadius: 100,
    overflow: "hidden",
  },
  actionButtonHorizontal: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
