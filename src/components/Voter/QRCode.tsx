import { Share, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import StyledQRCode from "../StyledQRCode";

export default function QRCodeComponent(props: {
  sessionId: string;
  type: string;
  safetyCode: string;
  size: number;
}) {
  const theme = useTheme();
  return (
    <View>
      <StyledQRCode
        value={`flickmate://voter/${props.sessionId}`}
        size={props.size}
      />
      <Button
        style={{ marginTop: 15 }}
        contentStyle={{ flexDirection: "row-reverse" }}
        icon={() => (
          <FontAwesome
            name="share"
            size={24}
            color={theme.colors.primary}
          />
        )}
        onPress={async () => {
          Share.share({
            message: "Hey! Join my room on Movie Picker: " + props.sessionId,
            title: "Join my room on Movie Picker",
            url: "https://flickmate.app/voter/" + props.sessionId.toUpperCase,
          });
        }}
      >
        <Text
          style={{
            fontSize: 25,
            letterSpacing: 1,
            color: theme.colors.primary,
          }}
        >
          {props.sessionId}
        </Text>
      </Button>
    </View>
  );
}
