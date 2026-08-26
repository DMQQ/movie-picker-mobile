import { CameraView, useCameraPermissions } from "expo-camera";
import Text from "../components/Text";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { useTheme } from "../hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, ToastAndroid, Vibration, View } from "react-native";

import { colors, common, fontSize, fontWeight, radius, spacing } from "../constants/design";
import { posthog } from "../constants/posthog";
import PrimaryButton from "../components/PrimaryButton";
import PageHeading from "../components/PageHeading";
import useTranslation from "../service/useTranslation";
import { throttle } from "../utils/throttle";
import { router } from "expo-router";
import { useIsFocused } from "expo-router";
import { url } from "../context/SocketContext";
import envs from "../constants/envs";
import SafeIOSContainer from "../components/SafeIOSContainer";
import UserInputModal from "../components/UserInputModal";

type JoinRoomParams =
  | {
      roomId?: string;
      sessionId?: string;
    }
  | string;

export default function QRScanner() {
  const [hasPermission, request] = useCameraPermissions();
  const [isManual, setIsManual] = useState(false);
  const theme = useTheme();
  const [isScanned, setIsScanned] = useState(false);
  const [scanError, setScanError] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [manualError, setManualError] = useState("");

  useEffect(() => {
    posthog?.capture("room_join_tapped");
  }, []);

  const joinRoom = async (c: JoinRoomParams) => {
    return new Promise(async (resolve, reject) => {
      const code = (typeof c === "string" ? c : c?.roomId || c?.sessionId) as string;

      try {
        const response = await fetch(`${url}/room/verify/${code}`, {
          headers: {
            authorization: `Bearer ${envs.server_auth_token}`,
          },
        });

        const data = await response.json();

        if (!data.exists) {
          reject(new Error("Room does not exist"));
          return;
        }

        if (code[0] === "V") {
          router.replace({
            pathname: `/voter`,
            params: { sessionId: code },
          });
        } else if (code[0] === "E") {
          router.replace(`/either-or/${code}`);
        } else router.replace(`/room/${code}`);

        resolve(true);
      } catch (error) {
        console.error("Failed to verify room:", error);
        reject(error);
      }
    });
  };

  const onBarcodeScanned = async (barCodeScannerResult: any) => {
    setIsScanned(true);

    if (!barCodeScannerResult) return;

    if (barCodeScannerResult.data?.startsWith("https") || barCodeScannerResult.data?.startsWith("flickmate://")) {
      const urlParts = barCodeScannerResult.data.replace("flickmate://", "").replace("https://flickmate.app/", "").split("/");

      const type = urlParts[urlParts.length - 2];

      const id = urlParts[urlParts.length - 1];

      if (type === "room" || type === "swipe" || type === "voter" || type === "either-or") {
        return joinRoom(id).catch((err) => {
          console.error("Error joining room from QR code:", err);
          setScanError(true);
          setIsScanned(false);
        });
      }
    }

    const isValid = barCodeScannerResult.data.includes("sessionId") || barCodeScannerResult.data.includes("roomId");

    if (!isValid) return;

    const parsed = JSON.parse(barCodeScannerResult?.data);

    try {
      Vibration.vibrate();

      await joinRoom(parsed);
    } catch (error) {
      setScanError(true);
      if (Platform.OS === "android") ToastAndroid.show(t("errors.invalid-qr"), ToastAndroid.SHORT);
    } finally {
      setIsScanned(false);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    console.log("Requesting camera permission...");
    !hasPermission?.granted && request();
  }, [isFocused, hasPermission?.granted]);

  const t = useTranslation();

  const [isJoining, setIsJoining] = useState(false);

  const onManualJoin = async () => {
    const code = manualCode.toUpperCase();

    if (!code) {
      setManualError(t("scanner.error-empty") as string);
      return;
    }

    const firstChar = code[0];
    if (firstChar !== "S" && firstChar !== "V" && firstChar !== "E") {
      setManualError(t("scanner.error-invalid-prefix") as string);
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch(`${url}/room/verify/${code}`, {
        headers: { authorization: `Bearer ${envs.server_auth_token}` },
      });
      const data = await response.json();

      if (!data.exists) {
        setManualError(t("scanner.error-room-not-found") as string);
        return;
      }

      // Navigate directly — router.replace unmounts this screen so the modal
      // disappears without a dismiss animation, same as the QR scan path.
      if (code[0] === "V") {
        router.replace({ pathname: "/voter", params: { sessionId: code } });
      } else if (code[0] === "E") {
        router.replace(`/either-or/${code}`);
      } else {
        router.replace(`/room/${code}`);
      }
    } catch {
      setManualError(t("scanner.error-room-not-found") as string);
    } finally {
      setIsJoining(false);
    }
  };

  const onScanErrorDismiss = () => {
    setScanError(false);
    setIsScanned(false);
  };

  const onManualDismiss = () => {
    setIsManual(false);
    setManualCode("");
    setManualError("");
  };

  const onManualCodeChange = (text: string) => {
    setManualCode(text);
    if (manualError) setManualError("");
  };

  return (
    <SafeIOSContainer style={{ flex: 1, backgroundColor: colors.appBackground, marginTop:0 }}>
      <PageHeading
        title={t("scanner.heading")}
        useSafeArea={Platform.OS === "android"}
        styles={Platform.OS === "ios" ? { marginTop: spacing.screen } : {}}
        showBackButton
        showRightIconButton
        onRightIconPress={() => setIsManual(true)}
        rightIconTitle={t("scanner.code")}
        rightIconName="keyboard-outline"
        tintColor={colors.primary}
      ></PageHeading>

      {hasPermission?.granted && isFocused ? (
        <>
          <CameraView
            key={`${hasPermission?.granted}-camera`}
            style={[{ flex: 1, justifyContent: "center", alignItems: "center" }, StyleSheet.absoluteFill]}
            facing="back"
            onBarcodeScanned={isScanned ? undefined : throttle(onBarcodeScanned, 1000)}
            mute
          />

          {/* Scanner Frame with Corner Brackets */}
          <View style={styles.scannerFrame}>
            {/* Semi-transparent center */}
            <View style={styles.scannerBackground} />

            {/* Top Left Corner */}
            <View style={[styles.corner, styles.cornerTopLeft, { borderColor: theme.colors.primary }]} />

            {/* Top Right Corner */}
            <View style={[styles.corner, styles.cornerTopRight, { borderColor: theme.colors.primary }]} />

            {/* Bottom Left Corner */}
            <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: theme.colors.primary }]} />

            {/* Bottom Right Corner */}
            <View style={[styles.corner, styles.cornerBottomRight, { borderColor: theme.colors.primary }]} />
          </View>
        </>
      ) : hasPermission === null ? (
        <View style={styles.permissionDenied}>
          <Text style={styles.permissionTitle}>{t("scanner.heading")}</Text>
          <Text style={styles.permissionSubtitle}>{t("scanner.requesting-permission")}</Text>
        </View>
      ) : (
        <View style={styles.permissionDenied}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="camera-off-outline" size={40} color={colors.placeholder} />
          </View>
          <Text style={styles.permissionTitle}>{t("scanner.permission-title")}</Text>
          <Text style={styles.permissionSubtitle}>
            {t("scanner.permission-denied")}
          </Text>
          <View style={styles.permissionButtons}>
            {hasPermission?.canAskAgain ? (
              <PrimaryButton onPress={() => request()}>
                {t("scanner.request-permission")}
              </PrimaryButton>
            ) : (
              <>
                <Text style={styles.codeHint}>
                  {t("scanner.manual-hint-prefix")} <Text style={styles.codeHintBold}>{t("scanner.code")}</Text>{" "}
                  {t("scanner.manual-hint-suffix")}
                </Text>
                <PrimaryButton onPress={() => setIsManual(true)}>
                  {t("scanner.join")}
                </PrimaryButton>
              </>
            )}
            <Button
              mode="outlined"
              onPress={() => Linking.openSettings()}
              style={common.pillButton}
              contentStyle={common.pillButton}
              labelStyle={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, letterSpacing: 0.8 }}
            >
              {t("scanner.open-settings")}
            </Button>
          </View>
        </View>
      )}

      <UserInputModal
        visible={scanError}
        onDismiss={onScanErrorDismiss}
        title={t("dialogs.qr.error")}
        subtitle={t("dialogs.qr.error-desc")}
        dismissable
        actions={[
          {
            label: t("dialogs.qr.close"),
            onPress: onScanErrorDismiss,
            mode: "contained",
          },
        ]}
      />

      <UserInputModal
        visible={isManual || isJoining}
        onDismiss={onManualDismiss}
        title={t("dialogs.qr.manual")}
        dismissable
        actions={[
          {
            label: t("scanner.join"),
            onPress: onManualJoin,
            mode: "contained",
            disabled: manualCode.length < 7,
            loading: isJoining,
          },
        ]}
      >
        <TextInput
          label={t("scanner.enter-code-label")}
          value={manualCode}
          maxLength={7}
          autoFocus
          onSubmitEditing={onManualJoin}
          onChangeText={onManualCodeChange}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect={false}
          style={styles.textInput}
          textAlign="center"
          contentStyle={{ letterSpacing: 8, textAlign: "center" }}
          error={!!manualError}
        />
        {manualError && <Text style={styles.errorText}>{manualError}</Text>}
      </UserInputModal>
    </SafeIOSContainer>
  );
}

const styles = StyleSheet.create({
  scannerFrame: {
    width: 250,
    height: 250,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -125 }, { translateY: -125 }],
  },
  scannerBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.modal,
  },
  corner: {
    position: "absolute",
    width: 50,
    height: 50,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  textInput: {
    borderRadius: radius.modal,
    fontSize: fontSize.xxl,
    letterSpacing: 1,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: fontSize.md - 1,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  permissionDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl + spacing.sm,
    gap: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    fontFamily: "Bebas",
    fontSize: 35,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  permissionSubtitle: {
    fontSize: fontSize.md,
    color: colors.placeholder,
    textAlign: "center",
    lineHeight: fontSize.md + 6,
    maxWidth: "80%",
    marginBottom: spacing.xl,
  },
  permissionButtons: {
    gap: spacing.md,
    width: "100%",
    maxWidth: 280,
  },
  codeHint: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    textAlign: "center",
    lineHeight: fontSize.sm + 6,
  },
  codeHintBold: {
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
});
