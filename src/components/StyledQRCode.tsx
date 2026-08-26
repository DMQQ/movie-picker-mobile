import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../hooks/useTheme";
import { radius, spacing } from "../constants/design";
import QRCode from "./QRCode";

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

  const logoSize = size * 0.18;
  const logoOffset = (size - logoSize) / 2;

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={{ width: size, height: size }}>
        <QRCode
          value={value}
          size={size}
          color={theme.colors.primary}
          backgroundColor={theme.colors.surface}
          clearArea={showLogo ? logoSize + spacing.sm : undefined}
        />

        {showLogo && (
          <Image
            source={require("../../assets/images/icon-light.png")}
            style={[
              styles.logo,
              {
                width: logoSize,
                height: logoSize,
                left: logoOffset,
                top: logoOffset,
                borderRadius: logoSize * 0.2,
              },
            ]}
            contentFit="contain"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.sm,
    position: "relative",
    borderWidth: 5,
    borderRadius: radius.modal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logo: {
    position: "absolute",
  },
});
