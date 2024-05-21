import { View } from "react-native";
import { Avatar } from "react-native-paper";

export const AVATAR_COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
];

export default function ActiveUsers(props: {
  data: string[];
  showAll?: boolean;
}) {
  const isVisible = props.showAll ? true : props.data.length > 1;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {isVisible &&
        props.data.slice(0, 6).map((nick, n) => (
          <Avatar.Text
            key={n}
            size={24}
            label={nick?.[0]?.toUpperCase()}
            color="white"
            style={{
              transform: [{ translateX: -n * 6.5 }],
              zIndex: n + 1,
              borderWidth: 0.5,
              borderColor: "#fff",
              backgroundColor: AVATAR_COLORS[n % AVATAR_COLORS.length],
            }}
          />
        ))}
    </View>
  );
}
