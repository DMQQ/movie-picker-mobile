import { View } from "react-native";
import { MD2DarkTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";

export default function QRCodeComponent(props: { sessionId: string; type: string; safetyCode: string; size: number }) {
  return (
    <View
      style={{
        padding: 10,
        borderColor: MD2DarkTheme.colors.primary,
        borderWidth: 5,
        width: props.size + 30,
        height: props.size + 30,
      }}
    >
      <QRCode
        backgroundColor={MD2DarkTheme.colors.primary}
        value={JSON.stringify({
          sessionId: props.sessionId,
          type: props.type,
          safetyCode: props.safetyCode,
        })}
        size={props.size}
      />
    </View>
  );
}
