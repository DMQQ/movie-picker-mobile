import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";
import IconButton from "./IconButton";
import Text from "./Text";
import { colors, radius, spacing, typography } from "../constants/design";

interface FormSheetContainerProps {
  children: ReactNode;
  /** Renders a title + close button header row */
  title?: string;
  /** Override close action — defaults to router.back() */
  onClose?: () => void;
  /** Wrap content in a ScrollView */
  scroll?: boolean;
  /** Wrap in KeyboardAvoidingView (use when sheet has text inputs) */
  keyboard?: boolean;
  /** Horizontal padding applied to the content area. Default: spacing.lg */
  padX?: number;
  style?: StyleProp<ViewStyle>;
}

export default function FormSheetContainer({
  children,
  title,
  onClose,
  scroll = false,
  keyboard = false,
  padX = spacing.lg,
  style,
}: FormSheetContainerProps) {
  const insets = useSafeAreaInsets();
  const handleClose = onClose ?? (() => router.back());

  const content = (
    <View
      style={[
        styles.inner,
        { paddingHorizontal: padX, paddingBottom: insets.bottom + spacing.lg },
        style,
      ]}
    >
      {title !== undefined && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <IconButton icon="close" size={20} iconColor={colors.placeholder} onPress={handleClose} />
        </View>
      )}
      {children}
    </View>
  );

  const scrollable = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {content}
    </ScrollView>
  ) : content;

  return (
    <View style={styles.root}>
      {Platform.OS === "android" && <View style={styles.grabber} />}
      {keyboard ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {scrollable}
        </KeyboardAvoidingView>
      ) : scrollable}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? spacing.xxl + spacing.sm : 0,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginTop: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.section,
    color: colors.text,
    letterSpacing: 0.5,
  },
});
