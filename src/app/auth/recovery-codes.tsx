import * as Clipboard from "expo-clipboard";
import Icon from "../../components/Icon";
import Text from "../../components/Text";
import { colors, fontWeight, fontSize, radius, spacing} from "../../constants/design";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, Share, StyleSheet, View } from "react-native";

import Button from "../../components/Button";
import PrimaryButton from "../../components/PrimaryButton";
import FadeSlide from "../../components/FadeSlide";

export default function RecoveryCodesScreen() {
  const { codes: codesParam, replacing } = useLocalSearchParams<{ codes: string; replacing?: string }>();
  const codes: string[] = JSON.parse(codesParam ?? "[]");
  const isReplacing = replacing === "true";
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    await Share.share({
      message: `My recovery codes:\n\n${codes.join("\n")}\n\nKeep these safe. Each can only be used once.`,
    });
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {Platform.OS === "android" && <View style={styles.grabber} />}

      <FadeSlide delay={0}>
        <View style={styles.iconWrap}>
          <Icon source="shield-key-outline" size={48} color="#F59E0B" />
        </View>
      </FadeSlide>

      <FadeSlide delay={80}>
        <Text style={styles.title}>{isReplacing ? "New Recovery Codes" : "Recovery Codes"}</Text>
        <Text style={styles.subtitle}>
          {isReplacing
            ? "Your old codes have been invalidated. Save these somewhere safe."
            : "Save these somewhere safe. They won't be shown again."}
        </Text>
      </FadeSlide>

      <FadeSlide delay={160}>
        <View style={[styles.warningRow, { borderColor: "rgba(239,68,68,0.3)", marginBottom: spacing.sm }]}>
          <Icon source="shield-alert-outline" size={15} color="#EF4444" />
          <Text style={[styles.warningText, { color: "#EF4444" }]}>
            Password reset via email is not available yet. These codes are the <Text style={{ fontWeight: "700", color: "#EF4444" }}>only way</Text> to recover your account if you forget your password. Save them now.
          </Text>
        </View>
        <View style={[styles.warningRow]}>
          <Icon source="information-outline" size={14} color="#F59E0B" />
          <Text style={styles.warningText}>Each code is single-use. Store them in a password manager.</Text>
        </View>
      </FadeSlide>

      <View style={styles.grid}>
        {codes.map((code, i) => (
          <FadeSlide key={i} delay={240 + i * 35} style={styles.codeCellWrap}>
            <View style={styles.codeCell}>
              <Text style={styles.codeIndex}>{i + 1}</Text>
              <Text style={styles.codeText}>{code}</Text>
            </View>
          </FadeSlide>
        ))}
      </View>

      <FadeSlide delay={240 + codes.length * 35 + 40}>
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleCopy}
            icon={copied ? "check" : "content-copy"}
            style={styles.actionBtn}
            textColor={copied ? "#34A853" : undefined}
          >
            {copied ? "Copied!" : "Copy all"}
          </Button>
          <Button
            mode="outlined"
            onPress={handleShare}
            icon="share-variant-outline"
            style={styles.actionBtn}
          >
            Share
          </Button>
        </View>

        <PrimaryButton onPress={() => router.dismiss()} style={styles.doneBtn}>
          I've saved my codes
        </PrimaryButton>
      </FadeSlide>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: spacing.xxl, paddingTop: spacing.lg, paddingBottom: spacing.xxl + 16 },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radius.xs - 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginBottom: spacing.xxl + 4,
  },

  iconWrap: { alignItems: "center", marginBottom: spacing.lg },
  title: { fontSize: 34, fontFamily: "Bebas", color: colors.text, letterSpacing: 1, marginBottom: spacing.xs + 2 },
  subtitle: { fontSize: fontSize.md, color: "#666", marginBottom: spacing.lg, lineHeight: 20 },

  warningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: radius.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
  },
  warningText: { fontSize: fontSize.md - 1, color: "#F59E0B", flex: 1, lineHeight: 18 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  codeCellWrap: { width: "48%" },
  codeCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radius.sm + 2,
    borderWidth: 1,
    borderColor: colors.overlay,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  codeIndex: {
    fontSize: fontSize.sm - 1,
    color: "rgba(255,255,255,0.3)",
    width: 14,
    textAlign: "center",
  },
  codeText: {
    fontSize: fontSize.md,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    color: colors.text,
    letterSpacing: 1,
    fontWeight: fontWeight.semibold,
  },

  actions: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginBottom: spacing.xl,
  },
  actionBtn: { flex: 1, borderRadius: radius.lg + 1 },

  doneBtn: { borderRadius: radius.lg + 1 },
  doneBtnContent: { paddingVertical: spacing.xs + 2 },
});
