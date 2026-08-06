import * as Clipboard from "expo-clipboard";
import { fontWeight } from "../../constants/design";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, Share, StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "react-native-paper";
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
      message: `My recovery codes:\n\n${codes.join("\n")}\n\nKeep these safe — each can only be used once.`,
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
            : "Save these somewhere safe — they won't be shown again."}
        </Text>
      </FadeSlide>

      <FadeSlide delay={160}>
        <View style={styles.warningRow}>
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

        <PrimaryButton onPress={() => router.dismissAll()} style={styles.doneBtn}>
          I've saved my codes
        </PrimaryButton>
      </FadeSlide>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, paddingTop: 16, paddingBottom: 40 },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginBottom: 28,
  },

  iconWrap: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 34, fontFamily: "Bebas", color: "#fff", letterSpacing: 1, marginBottom: 6 },
  subtitle: { fontSize: fontSize.md, color: "#666", marginBottom: 16, lineHeight: 20 },

  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: radius.sm + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  warningText: { fontSize: 13, color: "#F59E0B", flex: 1, lineHeight: 18 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  codeCellWrap: { width: "48%" },
  codeCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radius.sm + 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 12,
  },
  codeIndex: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    width: 14,
    textAlign: "center",
  },
  codeText: {
    fontSize: fontSize.md,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    color: "#fff",
    letterSpacing: 1,
    fontWeight: fontWeight.semibold,
  },

  actions: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginBottom: 20,
  },
  actionBtn: { flex: 1, borderRadius: 25 },

  doneBtn: { borderRadius: 25 },
  doneBtnContent: { paddingVertical: 6 },
});
