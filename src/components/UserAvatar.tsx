import { Image } from "expo-image";
import {  View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "../constants/design";
import { getUserAvatarImage } from "../utils/avatar";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  borderWidth?: number;
  borderColor?: string;
}

export default function UserAvatar({
  name = 'Anonymous',
  avatarUrl,
  size = 48,
  style,
  borderWidth = 0,
  borderColor = "transparent",
}: UserAvatarProps) {
  const source = avatarUrl ? { uri: avatarUrl } : getUserAvatarImage(name);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor,
          backgroundColor: colors.surfaceElevated,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Image
        style={{ width: size, height: size  }}
        source={source}
        cachePolicy="memory-disk"
        contentFit="cover"
      />
    </View>
  );
}
