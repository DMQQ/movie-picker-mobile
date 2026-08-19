import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Text from "../Text";
import AvatarText from "../AvatarText";
import { getUserAvatarColor, getInitials } from "../../utils/avatar";
import { colors, fontSize, spacing } from "../../constants/design";

export interface LobbyPlayer {
  id: string;
  name: string;
  isActive?: boolean;
}

interface Props {
  players: LobbyPlayer[];
  waitingLabel: string;
}

export default function PlayersRow({ players, waitingLabel }: Props) {
  if (players.length === 0) return null;

  return (
    <View style={styles.playersRow}>
      <View style={styles.avatarsStack}>
        {players.map((player, index) => (
          <Animated.View key={player.id} entering={FadeInDown.duration(300)} style={index > 0 && styles.avatarOverlap}>
            <AvatarText
              size={32}
              label={getInitials(player.name) || "?"}
              style={{
                backgroundColor: getUserAvatarColor(player.name),
                borderWidth: 2,
                borderColor: colors.appBackground,
                opacity: player.isActive === false ? 0.4 : 1,
              }}
            />
          </Animated.View>
        ))}
      </View>
      <Text style={styles.playersCount}>{players.length > 1 ? `${players.length} active` : waitingLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  playersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatarsStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarOverlap: {
    marginLeft: -12,
  },
  playersCount: {
    color: colors.placeholder,
    fontSize: fontSize.sm,
  },
});
