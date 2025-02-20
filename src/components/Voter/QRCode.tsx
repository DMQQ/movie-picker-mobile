import { Share, TouchableOpacity, View } from "react-native";
import { Button, MD2DarkTheme, Text, useTheme } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

export default function QRCodeComponent(props: { sessionId: string; type: string; safetyCode: string; size: number }) {
  const theme = useTheme();
  return (
    <View>
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
          backgroundColor={theme.colors.surface}
          color={theme.colors.primary}
          value={`flickmate://voter/${props.sessionId}`}
          size={props.size}
        />
      </View>
      <Button
        onLongPress={async () => {
          Share.share({
            message: "Hey! Join my room on Movie Picker: " + props.sessionId,
            title: "Join my room on Movie Picker",
            url: "https://movie.dmqq.dev/voter/" + props.sessionId.toUpperCase,
          });
        }}
        onPress={async () => {
          await Clipboard.setStringAsync("https://movie.dmqq.dev/voter/" + props.sessionId.toUpperCase);
        }}
      >
        <Text style={{ fontSize: 25, letterSpacing: 1, color: theme.colors.primary }}>{props.sessionId}</Text>
      </Button>
    </View>
  );
}
