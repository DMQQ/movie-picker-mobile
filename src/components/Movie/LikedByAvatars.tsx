import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import UserAvatar from "../UserAvatar";
import { colors, fontWeight, fontSize, radius} from "../../constants/design";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  row: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    zIndex: 15,
  },
  wrapper: {
    marginLeft: 0,
  },
  thumbBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#1e88e5",
    borderRadius: radius.sm + 1,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.appBackground,
  },
});

export default function LikedByAvatars({
  likedBy,
}: {
  likedBy: { userId: string; username: string }[];
}) {
  const visible = likedBy.slice(0, 4);
  return (
    <View style={styles.row}>
      {visible.map((user, i) => (
        <View
          key={user.userId}
          style={[
            styles.wrapper,
            {
              marginLeft: i > 0 ? -12 : 0,
              zIndex: visible.length - i,
            },
          ]}
        >
          <UserAvatar
            name={user.username}
            size={38}
            borderWidth={2}
            borderColor={colors.appBackground}
          />
          <View style={styles.thumbBadge}>
            <MaterialCommunityIcons name="thumb-up" size={10} color={colors.text} />
          </View>
        </View>
      ))}
    </View>
  );
}
