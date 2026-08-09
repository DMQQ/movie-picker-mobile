import type { ReactNode } from "react";
import { Modal, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Text from "./Text";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

interface DialogProps {
  visible: boolean;
  onDismiss?: () => void;
  dismissable?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

function DialogTitle({ children }: { children?: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

function DialogContent({ children }: { children?: ReactNode }) {
  return <View style={styles.content}>{children}</View>;
}

function DialogActions({ children }: { children?: ReactNode }) {
  return <View style={styles.actions}>{children}</View>;
}

function DialogBase({ visible, onDismiss, dismissable = true, style, children }: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissable ? onDismiss : undefined}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, style]}>{children}</View>
      </View>
    </Modal>
  );
}

const Dialog = Object.assign(DialogBase, {
  Title: DialogTitle,
  Content: DialogContent,
  Actions: DialogActions,
});

export default Dialog;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
  },
  content: {
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
