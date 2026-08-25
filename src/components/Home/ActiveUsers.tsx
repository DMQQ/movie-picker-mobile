import { memo } from "react";
import UserAvatar from "../UserAvatar";
import { Pressable, View } from "react-native";

import { colors } from "../../constants/design";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

interface ActiveUsersProps {
  data: string[];
  showAll?: boolean;
  onPress?: () => void;
  size?: number;
}

function ActiveUsers(props: ActiveUsersProps) {
  const { size = 32 } = props;
  const isVisible = props.showAll ? true : props.data.length > 1;

  return (
    <Animated.View entering={FadeIn.delay(250)} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable
        onPress={props.onPress}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          position: "relative",
          width: Math.min(6, props.data?.length || 0) * (size - 8),
        }}
      >
        {isVisible ? (
          props.data.slice(0, 6).map((nick, n) => (
            <View
              key={n}
              style={{
                transform: [{ translateX: -n * 6.5 }],
                zIndex: n + 1,
                position: "relative",
              }}
            >
              <UserAvatar
                name={nick}
                size={size}
              />
              {n === 0 && (
                <MaterialCommunityIcons
                  name="crown"
                  size={12}
                  color="#FFD700"
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: [{ translateX: -5 }],
                    textShadowColor: "rgba(0, 0, 0, 0.5)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                />
              )}
            </View>
          ))
        ) : (
          <UserAvatar
            name={props.data[0] || "Guest"}
            size={size}
            borderWidth={0.5}
            borderColor={colors.text}
          />
        )}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ translateX: -props.data.length * 6.5 }],
            zIndex: (props.data?.length || 0) + 1,
            borderWidth: 0.5,
            borderColor: colors.text,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="plus" size={size * 0.5} color={colors.text} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default memo(ActiveUsers);
