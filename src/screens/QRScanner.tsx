import { CommonActions, useNavigation } from "@react-navigation/native";
import { useCameraPermissions, CameraView } from "expo-camera/next";
import { useEffect, useState } from "react";
import { ToastAndroid, View, Vibration } from "react-native";
import {
  Button,
  Dialog,
  FAB,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function QRScanner() {
  const [hasPermission, request] = useCameraPermissions();
  const [isManual, setIsManual] = useState(false);
  const theme = useTheme();
  const [isScanned, setIsScanned] = useState(false);
  const navigation = useNavigation<any>();

  const onBarcodeScanned = (barCodeScannerResult: any) => {
    setIsScanned(true);
    Vibration.vibrate();

    const isValid =
      !barCodeScannerResult?.data?.startsWith("https://") &&
      barCodeScannerResult.data.includes("roomId");

    if (!isValid) return;

    const parsed = JSON.parse(barCodeScannerResult?.data);

    if (!parsed.roomId)
      return ToastAndroid.show("Invalid QR code", ToastAndroid.SHORT);

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: parsed,
          },
        ],
      })
    );
  };

  useEffect(() => {
    !hasPermission?.granted && request();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={{ marginTop: 25, fontWeight: "bold", fontSize: 25 }}>
          Requesting camera permission
        </Text>

        <Button mode="contained" onPress={() => request()}>
          Request permission
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
            onDismiss={() => setIsScanned(false)}
            visible={isScanned}
            style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}
          >
            <Dialog.Title>Something went wrong!</Dialog.Title>

            <Dialog.Content>
              <Text>Invalid QR code</Text>
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={() => setIsScanned(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog
            dismissable={true}
            onDismiss={() => setIsManual(false)}
            visible={isManual}
            style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}
          >
            <Dialog.Title>Join room manually</Dialog.Title>

            <Dialog.Actions>
              <ManualCodeInput navigation={navigation} />
            </Dialog.Actions>
          </Dialog>
        </>
      </Portal>

      <FAB
        theme={{ colors: { accent: theme.colors.primary } }}
        label="Join manually"
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

const ManualCodeInput = ({ navigation }: { navigation: any }) => {
  const [code, setCode] = useState("");

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <TextInput
        mode="outlined"
        label="Enter code"
        value={code}
        onChangeText={setCode}
        style={{ marginBottom: 10, borderRadius: 20 }}
      />

      <Button
        mode="text"
        onPress={() => {
          if (code && code.length > 15) {
            Vibration.vibrate();
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
          } else {
            ToastAndroid.show("Please enter a code", ToastAndroid.SHORT);
          }
        }}
        style={{ marginTop: 10 }}
      >
        Join room
      </Button>
    </View>
  );
};
