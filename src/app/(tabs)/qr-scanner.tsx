import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, ToastAndroid, Vibration, View } from "react-native";
import { Button, MD2DarkTheme, Text, TextInput, useTheme } from "react-native-paper";
import PageHeading from "../../components/PageHeading";
import useTranslation from "../../service/useTranslation";
import { throttle } from "../../utils/throttle";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { url } from "../../context/SocketContext";
import envs from "../../constants/envs";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import UserInputModal from "../../components/UserInputModal";

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
  const [isScannError, setIsScanError] = useState(false);
  const [manualCode, setManualCode] = useState("");

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
      const urlParts = barCodeScannerResult.data.replace("flickmate://", "").replace("https://movie.dmqq.dev/", "").split("/");

      const type = urlParts[urlParts.length - 2];

      const id = urlParts[urlParts.length - 1];

      if (type === "room" || type === "swipe" || type === "voter") {
        return joinRoom(id).catch((err) => {
          console.error("Error joining room from QR code:", err);
          setIsScanError(true);
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
      setIsScanError(true);
      if (Platform.OS === "android") ToastAndroid.show("Invalid QR code", ToastAndroid.SHORT);
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

  const onManualJoin = async () => {
    if (manualCode) {
      joinRoom(manualCode.toUpperCase())
        .then(() => {
          setManualCode("");
          setIsManual(false);
        })
        .catch(() => {
          setIsManual(false);
          setIsScanError(true);
        });
    } else {
      if (Platform.OS === "android") {
        ToastAndroid.show("Invalid code", ToastAndroid.SHORT);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <SafeIOSContainer style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ marginTop: 25, fontWeight: "bold", fontSize: 25 }}>Requesting camera permission</Text>

        <Button mode="contained" onPress={() => request()}>
          {t("scanner.request-permission")}
        </Button>
      </SafeIOSContainer>
    );
  }

  return (
    <SafeIOSContainer style={{ flex: 1, backgroundColor: "#000" }}>
      <PageHeading
        title={t("scanner.heading")}
        useSafeArea
        showBackButton={false}
        showRightIconButton
        // rightIconName="plus"
        onRightIconPress={() => setIsManual(true)}
        extraScreenPaddingTop={Platform.OS === "android" ? 20 : 0}
        rightIconTitle="Join"
        tintColor={MD2DarkTheme.colors.primary}
      ></PageHeading>

      {hasPermission.granted && isFocused && (
        <CameraView
          key={`${hasPermission?.granted}-camera`}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          facing="back"
          onBarcodeScanned={isScanned ? undefined : throttle(onBarcodeScanned, 1000)}
          mute
        />
      )}

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

      <UserInputModal
        visible={isScannError}
        onDismiss={() => setIsScanError(false)}
        title={t("dialogs.qr.error")}
        subtitle={t("dialogs.qr.error-desc")}
        dismissable
        actions={[
          {
            label: t("dialogs.qr.close"),
            onPress: () => setIsScanError(false),
            mode: "contained",
          },
        ]}
      />

      <UserInputModal
        visible={isManual}
        onDismiss={() => {
          setIsManual(false);
          setManualCode("");
        }}
        title={t("dialogs.qr.manual")}
        dismissable
        actions={[
          {
            label: t("scanner.join"),
            onPress: onManualJoin,
            mode: "contained",
          },
        ]}
      >
        <TextInput
          mode="outlined"
          label="Enter code"
          value={manualCode}
          maxLength={7}
          autoFocus
          onSubmitEditing={onManualJoin}
          onChangeText={setManualCode}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect={false}
          style={styles.textInput}
        />
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
    borderRadius: 20,
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
    borderRadius: 20,
    fontSize: 20,
    letterSpacing: 1,
  },
});
