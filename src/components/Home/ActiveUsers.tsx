import { memo } from "react";
import AvatarIcon from "../AvatarIcon";
import AvatarText from "../AvatarText";
import { Pressable, View } from "react-native";

import { colors } from "../../constants/design";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { getUserAvatarColor, getInitials } from "../../utils/avatar";

function ActiveUsers(props: { data: string[]; showAll?: boolean; onPress?: () => void }) {
  const isVisible = props.showAll ? true : props.data.length > 1;

  return (
    <Animated.View entering={FadeIn.delay(250)} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable
        onPress={props.onPress}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          position: "relative",
          width: Math.min(6, props.data?.length || 0) * 24,
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
              <AvatarText
                size={24}
                label={getInitials(nick || "")}
                color={colors.text}
                style={{
                  borderWidth: 0.5,
                  borderColor: colors.text,
                  backgroundColor: getUserAvatarColor(nick),
                }}
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
          <AvatarIcon
            size={24}
            icon="account"
            color={colors.text}
            style={{
              borderWidth: 0.5,
              borderColor: colors.text,
              backgroundColor: getUserAvatarColor(""),
            }}
          />
        )}
        <AvatarIcon
          size={24}
          icon="plus"
          style={{
            transform: [{ translateX: -props.data.length * 6.5 }],
            zIndex: (props.data?.length || 0) + 1,
            borderWidth: 0.5,
            borderColor: colors.text,
            backgroundColor: colors.surface,
          }}
        />
      </Pressable>
    </Animated.View>
  );
}

export default memo(ActiveUsers);
