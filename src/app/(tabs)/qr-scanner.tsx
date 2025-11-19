import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import { Platform, ToastAndroid, Vibration, View } from "react-native";
import { Button, Dialog, Portal, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHeading from "../../components/PageHeading";

import useTranslation from "../../service/useTranslation";
import { throttle } from "../../utils/throttle";
import { router, useFocusEffect } from "expo-router";
import { url } from "../../context/SocketContext";
import envs from "../../constants/envs";

export default function QRScanner() {
  const [hasPermission, request] = useCameraPermissions();
  const [isManual, setIsManual] = useState(false);
  const theme = useTheme();
  const [isScanned, setIsScanned] = useState(false);
  const [isScannError, setIsScanError] = useState(false);

  const joinRoom = async (c: any) => {
    return new Promise(async (resolve, reject) => {
      //@ts-ignore
      const code = c?.roomId || c?.sessionId || c;

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

      console.log("Scanned URL parts:", urlParts);

      const type = urlParts[urlParts.length - 2];

      const id = urlParts[urlParts.length - 1];

      console.log("Scanned QR code type and id:", type, id);

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

  useEffect(() => {
    !hasPermission?.granted && request();
  }, []);

  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const t = useTranslation();

  if (hasPermission === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ marginTop: 25, fontWeight: "bold", fontSize: 25 }}>Requesting camera permission</Text>

        <Button mode="contained" onPress={() => request()}>
          {t("scanner.request-permission")}
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <PageHeading
        title={t("scanner.heading")}
        useSafeArea
        showBackButton={false}
        showRightIconButton
        rightIconName="plus"
        onRightIconPress={() => setIsManual(true)}
        extraScreenPaddingTop={Platform.OS === "android" ? 20 : 0}
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

      <View
        style={{
          flexDirection: "row",
          width: 200,
          height: 200,
          borderWidth: 2,
          borderColor: "#fff",
          backgroundColor: "rgba(255,255,255,0.2)",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
        }}
      />

      <Portal>
        <>
          <Dialog
            dismissable={true}
            onDismiss={() => setIsScanError(false)}
            visible={isScannError}
            style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}
          >
            <Dialog.Title>{t("dialogs.qr.error")}</Dialog.Title>

            <Dialog.Content>
              <Text>{t("dialogs.qr.error-desc")}</Text>
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={() => setIsScanError(false)}>{t("dialogs.qr.close")}</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog
            dismissable={true}
            onDismiss={() => setIsManual(false)}
            visible={isManual}
            style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}
          >
            <Dialog.Title>{t("dialogs.qr.manual")}</Dialog.Title>

            <Dialog.Actions>
              <ManualCodeInput
                joinRoom={joinRoom}
                onError={() => {
                  setIsManual(false);
                  setIsScanError(true);
                }}
              />
            </Dialog.Actions>
          </Dialog>
        </>
      </Portal>
    </SafeAreaView>
  );
}

const ManualCodeInput = ({ joinRoom, onError }: { joinRoom: (code: string) => Promise<any>; onError: () => void }) => {
  const [code, setCode] = useState("");

  const onManualPress = async () => {
    if (code) {
      joinRoom(code.toUpperCase()).catch(() => {
        onError();
      });
    } else {
      ToastAndroid.show("Invalid code", ToastAndroid.SHORT);
    }
  };

  const t = useTranslation();

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <TextInput
        mode="outlined"
        label="Enter code"
        value={code}
        maxLength={7}
        autoFocus
        textAlign="center"
        onSubmitEditing={onManualPress}
        onChangeText={setCode}
        // Add these props to help prevent double input
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect={false}
        style={{
          marginBottom: 10,
          borderRadius: 20,
          textTransform: "uppercase",
          textAlign: "center",
          fontSize: 20,
          letterSpacing: 1,
        }}
      />

      <Button mode="text" onPress={onManualPress} style={{ marginTop: 10 }}>
        {t("scanner.join")}
      </Button>
    </View>
  );
};
