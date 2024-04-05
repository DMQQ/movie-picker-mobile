import { CommonActions } from "@react-navigation/native";
import { useCameraPermissions, CameraView, Camera } from "expo-camera/next";
import { useEffect, useState } from "react";
import { ToastAndroid, View, Vibration } from "react-native";
import { Button, Text } from "react-native-paper";

export default function QRScanner({ navigation }: any) {
  const [hasPermission, request] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);

  const onBarcodeScanned = (barCodeScannerResult: any) => {
    setIsScanned(true);
    Vibration.vibrate();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: {
              ...JSON.parse(barCodeScannerResult.data),
            },
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
      {isScanned && (
        <View style={{ padding: 10 }}>
          <Button
            mode="contained"
            onPress={() => setIsScanned(false)}
            contentStyle={{ padding: 5 }}
          >
            Scan again
          </Button>
        </View>
      )}
    </View>
  );
}
