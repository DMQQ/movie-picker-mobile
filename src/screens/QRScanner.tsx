import { CommonActions, useNavigation } from "@react-navigation/native";
import { useCameraPermissions, CameraView, Camera } from "expo-camera/next";
import { useEffect, useState } from "react";
import { ToastAndroid, View, Vibration } from "react-native";
import { Button, FAB, Text, TextInput } from "react-native-paper";

export default function QRScanner({ navigation }: any) {
  const [hasPermission, request] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);

  const onBarcodeScanned = (barCodeScannerResult: any) => {
    setIsScanned(true);
    Vibration.vibrate();

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

      <View style={{ padding: 10 }}>
        {isScanned && (
          <Button
            mode="contained"
            onPress={() => setIsScanned(false)}
            contentStyle={{ padding: 7.5 }}
            style={{ marginBottom: 100 }}
          >
            Scan again
          </Button>
        )}
        <ManualCodeInput />
      </View>
    </View>
  );
}

const ManualCodeInput = () => {
  const [code, setCode] = useState("");
  const navigation = useNavigation<any>();

  return (
    <View>
      <TextInput
        mode="outlined"
        label="Enter code"
        value={code}
        onChangeText={setCode}
        style={{ marginBottom: 10, borderRadius: 20 }}
      />

      <Button
        mode="contained"
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
        contentStyle={{ padding: 7.5 }}
        style={{ borderRadius: 100 }}
      >
        Join room
      </Button>
    </View>
  );
};
