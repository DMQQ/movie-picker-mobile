import { StyleSheet, View } from "react-native";
import UserAvatar from "../UserAvatar";
import { useAppSelector } from "../../redux/store";
import { colors, radius, spacing, withAlpha } from "../../constants/design";

export default function ActivePlayers() {
  const users = useAppSelector((state) => state.eitherOr.users);

  if (users.length < 2) return null;

  return (
    <View style={styles.pill}>
      {users.map((user, index) => (
        <View key={user.userId} style={[index > 0 && styles.avatarOverlap, { opacity: user.isActive ? 1 : 0.35 }]}>
          <UserAvatar
            name={user.username || "?"}
            size={32}
            borderWidth={2}
            borderColor={colors.appBackground}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: withAlpha(colors.surface, 0.85),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  avatarOverlap: {
    marginLeft: -12,
  },
});
