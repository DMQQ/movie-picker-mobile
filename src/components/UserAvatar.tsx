import { Image } from "expo-image";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Text from "./Text";
import { colors, fontSize, fontWeight } from "../constants/design";
import { getUserAvatarColor, getInitials } from "../utils/avatar";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  borderWidth?: number;
  borderColor?: string;
}

export default function UserAvatar({
  name,
  avatarUrl,
  size = 48,
  style,
  borderWidth = 0,
  borderColor = "transparent",
}: UserAvatarProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor,
          backgroundColor: avatarUrl ? undefined : getUserAvatarColor(name),
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {avatarUrl ? (
        <Image
          style={{ width: size, height: size }}
          source={{ uri: avatarUrl }}
          cachePolicy="memory-disk"
        />
      ) : (
        <Text
          style={{
            fontSize: size * 0.4,
            fontWeight: fontWeight.bold,
            color: colors.text,
          }}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
