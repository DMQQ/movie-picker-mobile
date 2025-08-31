import { CommonActions, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useContext, useEffect, useState } from "react";
import { Platform, ToastAndroid, Vibration, View } from "react-native";
import { Button, Dialog, FAB, Portal, Text, TextInput, useTheme } from "react-native-paper";
import PageHeading from "../../components/PageHeading";
import { useAppSelector } from "../../redux/store";
import { SocketContext } from "../../service/SocketContext";
import useTranslation from "../../service/useTranslation";
import { throttle } from "../../utils/throttle";

export default function QRScanner({ navigation }: any) {
  const [hasPermission, request] = useCameraPermissions();
  const [isManual, setIsManual] = useState(false);
  const theme = useTheme();
  const [isScanned, setIsScanned] = useState(false);
  const [isScannError, setIsScanError] = useState(false);

  const nickname = useAppSelector((state) => state.room.nickname);

  const { socket } = useContext(SocketContext);

  const joinRoom = async (c: any) => {
    return new Promise(async (resolve, reject) => {
      //@ts-ignore
      const code = c?.roomId || c?.sessionId || c;

      if (code[0] === "V") {
        return navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "Voter",
                state: {
                  routes: [
                    {
                      name: "Home",
                      params: { sessionId: code },
                    },
                  ],
                },
              },
            ],
          })
        );
      }

      try {
        //@ts-ignore

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

  const onBarcodeScanned = async (barCodeScannerResult: any) => {
    setIsScanned(true);

    if (!barCodeScannerResult) return;

    if (barCodeScannerResult.data?.startsWith("https") || barCodeScannerResult.data?.startsWith("flickmate://")) {
      const urlParts = barCodeScannerResult.data.split("/");

      const type = urlParts[urlParts.length - 2];

      const id = urlParts[urlParts.length - 1];

      if (type === "voter" || type === "swipe") {
        return joinRoom(id).catch(() => {
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
      if (Platform.OS === "android") ToastAndroid.show("Invalid QR code", ToastAndroid.SHORT);
    } finally {
      setIsScanned(false);
    }
  };

  useEffect(() => {
    !hasPermission?.granted && request();
  }, []);

  const isFocused = useIsFocused();

  const t = useTranslation();

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ marginTop: 25, fontWeight: "bold", fontSize: 25 }}>Requesting camera permission</Text>

        <Button mode="contained" onPress={() => request()}>
          {t("scanner.request-permission")}
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <PageHeading title={t("scanner.heading")} />

      {hasPermission.granted && isFocused && (
        <CameraView
          key={`${hasPermission?.granted}-camera`}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          facing="back"
          onBarcodeScanned={isScanned ? undefined : throttle(onBarcodeScanned, 1000)}
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
      )}

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
