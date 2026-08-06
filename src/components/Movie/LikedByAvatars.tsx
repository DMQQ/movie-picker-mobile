import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontWeight, fontSize, radius } from "../../constants/design";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { getUserAvatarColor } from "../../utils/avatar";

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
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.modal - 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  initial: {
    color: "#fff",
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md + 1,
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
    borderColor: "#000",
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
          <View
            style={[
              styles.avatar,
              { backgroundColor: getUserAvatarColor(user.username) },
            ]}
          >
            <Text style={styles.initial}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.thumbBadge}>
            <MaterialCommunityIcons name="thumb-up" size={10} color="#fff" />
          </View>
        </View>
      ))}
    </View>
  );
}
