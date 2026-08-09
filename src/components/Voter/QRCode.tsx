import { Share, View } from "react-native";
import Text from "../Text";
import { useTheme } from "../../hooks/useTheme";

import Button from "../Button";
import { colors, spacing } from "../../constants/design";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
        style={{ marginTop: spacing.screen }}
        contentStyle={{ flexDirection: "row-reverse" }}
        icon={() => (
          <MaterialCommunityIcons
            name="share"
            size={24}
            color={theme.colors.primary}
          />
        )}
        onPress={async () => {
          Share.share({
            message:
              "Hey! Join my room on Movie Picker: " +
              "https://flickmate.app/voter/" +
              props.sessionId.toUpperCase(),
            title: "Join my room on Movie Picker",
            url: "https://flickmate.app/voter/" + props.sessionId.toUpperCase(),
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
