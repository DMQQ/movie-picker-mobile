import { memo } from "react";
import { Pressable, View } from "react-native";
import { Avatar, MD2DarkTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const AVATAR_COLORS = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3"];

function ActiveUsers(props: { data: string[]; showAll?: boolean; onPress?: () => void }) {
  const isVisible = props.showAll ? true : props.data.length > 1;

  console.log("ActiveUsers rendered with data:", props.data);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
              <Avatar.Text
                size={24}
                label={nick?.[0]?.toUpperCase()}
                color="white"
                style={{
                  borderWidth: 0.5,
                  borderColor: "#fff",
                  backgroundColor: AVATAR_COLORS[n % AVATAR_COLORS.length],
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
          <Avatar.Icon
            size={24}
            icon="account"
            color="white"
            style={{
              borderWidth: 0.5,
              borderColor: "#fff",
              backgroundColor: AVATAR_COLORS[0 % AVATAR_COLORS.length],
            }}
          />
        )}
        <Avatar.Icon
          size={24}
          icon="plus"
          style={{
            transform: [{ translateX: -props.data.length * 6.5 }],
            zIndex: (props.data?.length || 0) + 1,
            borderWidth: 0.5,
            borderColor: "#fff",
            backgroundColor: MD2DarkTheme.colors.surface,
          }}
        />
      </Pressable>
    </View>
  );
}

export default memo(ActiveUsers);
