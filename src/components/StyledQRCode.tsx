import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";

interface StyledQRCodeProps {
  value: string;
  size: number;
  showLogo?: boolean;
}

export default function StyledQRCode({
  value,
  size,
  showLogo = true,
}: StyledQRCodeProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.primary,
        },
      ]}
    >
      <QRCode
        backgroundColor={theme.colors.surface}
        color={theme.colors.primary}
        value={value}
        size={size}
        {...(showLogo && {
          logo: require("../../assets/images/icon-light.png"),
          logoSize: 50,
          logoBackgroundColor: "#000",
          logoMargin: 5,
          ecl: "H" as const,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 15,
    borderWidth: 5,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
});
