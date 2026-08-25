import { memo } from "react";
import { Dimensions, Pressable, Share, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import Text from "../Text";
import StyledQRCode from "../StyledQRCode";
import TutorialTips from "./TutorialTips";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, fontWeight, spacing } from "../../constants/design";
import { posthog } from "../../constants/posthog";

interface Props {
  code: string;
  scheme: string;
  webPath: string;
}

const QrCodeBox = memo(({ code, scheme, webPath }: Props) => {
  const theme = useTheme();
  const t = useTranslation();
  const upperCode = code.toUpperCase();
  const webUrl = `https://flickmate.app/${webPath}/${upperCode}`;

  const shareCode = async () => {
    const result = await Share.share({
      message: t("room.share.message", { code }) + "\nOr join via " + webUrl,
      title: t("room.share.title") as string,
      url: webUrl,
    });
    if (result.action === Share.sharedAction) {
      posthog?.capture("room_link_shared");
    }
  };

  return (
    <View style={styles.qrBoxContainer}>
      <StyledQRCode value={`flickmate://${scheme}/${upperCode}`} size={Dimensions.get("screen").width * 0.6} />

      <Pressable onPress={shareCode} style={styles.shareButton}>
        <View style={styles.codeRow}>
          {code.split("").map((char, index) => (
            <Text key={index} style={styles.codeChar}>
              {char}
            </Text>
          ))}
        </View>
        <Text style={styles.shareButtonText}>
          {t("room.share.button")} <MaterialCommunityIcons name="share" size={20} color={theme.colors.primary} />
        </Text>
      </Pressable>

      <TutorialTips />
    </View>
  );
});

export default QrCodeBox;

const styles = StyleSheet.create({
  qrBoxContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  shareButton: {
    marginTop: spacing.sm + 2,
  },
  codeRow: {
    flexDirection: "row",
    gap: spacing.xs + 1,
    justifyContent: "center",
    alignItems: "center",
  },
  codeChar: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  shareButtonText: {
    opacity: 0.7,
    textAlign: "center",
  },
  asyncHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  asyncHintText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    textAlign: "center",
    lineHeight: 18,
  },
});
