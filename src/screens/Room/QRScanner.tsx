import { CommonActions } from "@react-navigation/native";
import { useCameraPermissions, CameraView } from "expo-camera";
import { useContext, useEffect, useState } from "react";
import { ToastAndroid, View, Vibration } from "react-native";
import { Appbar, Button, Dialog, FAB, Portal, Text, TextInput, useTheme } from "react-native-paper";
import { SocketContext } from "../../service/SocketContext";
import { useAppSelector } from "../../redux/store";
import { ScreenProps } from "../types";
import useTranslation from "../../service/useTranslation";

export default function QRScanner({ navigation }: any) {
  const [hasPermission, request] = useCameraPermissions();
  const [isManual, setIsManual] = useState(false);
  const theme = useTheme();
  const [isScanned, setIsScanned] = useState(false);
  const [isScannError, setIsScanError] = useState(false);

  const { nickname } = useAppSelector((state) => state.room);

  const { socket } = useContext(SocketContext);

  const onBarcodeScanned = async (barCodeScannerResult: any) => {
    setIsScanned(true);
    Vibration.vibrate();

    const isValid = !barCodeScannerResult?.data?.startsWith("https://") && barCodeScannerResult.data.includes("roomId");

    if (!isValid) return;

    const parsed = JSON.parse(barCodeScannerResult?.data);

    if (!parsed.roomId) return ToastAndroid.show("Invalid QR code", ToastAndroid.SHORT);

    try {
      await joinRoom(parsed.roomId);
    } catch (error) {
      ToastAndroid.show("Invalid QR code", ToastAndroid.SHORT);
    }
  };

  const joinRoom = async (code: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await socket?.emitWithAck("join-room", code, nickname);

        if (response.joined) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "Home",
                  params: {
                    roomId: code,
                  },
                },
              ],
            })
          );
          resolve(true);
        } else {
          reject(false);
          setIsScanError(true);
        }
      } catch (error) {
        reject(error);
        setIsScanned(false);
        setIsScanError(true);
      } finally {
        setIsManual(false);
      }
    });
  };

  useEffect(() => {
    !hasPermission?.granted && request();
  }, []);

  const t = useTranslation();

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ marginTop: 25, fontWeight: "bold", fontSize: 25 }}>Requesting camera permission</Text>

        <Button mode="contained" onPress={() => request()}>
          {t("scanner.request-permission")}
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header style={{ backgroundColor: "#000" }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t("scanner.heading")} />
      </Appbar.Header>
      <CameraView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        facing="back"
        onBarcodeScanned={isScanned ? undefined : onBarcodeScanned}
        mute
      >
        <View
          style={{
            flexDirection: "row",
            width: 200,
            height: 200,
            borderWidth: 2,
            borderColor: "#fff",
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />
      </CameraView>

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
              <ManualCodeInput joinRoom={joinRoom} />
            </Dialog.Actions>
          </Dialog>
        </>
      </Portal>

      <FAB
        theme={{ colors: { accent: theme.colors.primary } }}
        label={t("dialogs.qr.manual")}
        onPress={() => setIsManual(true)}
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
        }}
      />
    </View>
  );
}

const ManualCodeInput = ({ joinRoom }: { joinRoom: (code: string) => Promise<any> }) => {
  const [code, setCode] = useState("");

  const onManualPress = async () => {
    if (code) {
      joinRoom(code.toUpperCase()).catch(() => {});
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
        value={code.toUpperCase()}
        onChangeText={setCode}
        style={{ marginBottom: 10, borderRadius: 20 }}
      />

      <Button mode="text" onPress={onManualPress} style={{ marginTop: 10 }}>
        {t("scanner.join")}
      </Button>
    </View>
  );
};
