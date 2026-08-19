import { Platform, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../constants/design";

interface Props {
  children: React.ReactNode;
  bottomContent: React.ReactNode;
  actions: React.ReactNode;
}

export default function LobbyShell({ children, bottomContent, actions }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>{children}</View>

      <View style={styles.bottomSection}>
        {bottomContent}
        {actions}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  bottomSection: {
    padding: spacing.screen,
    gap: spacing.xs + 3.5,
    paddingBottom: Platform.OS === "android" ? spacing.screen : 0,
  },
});
