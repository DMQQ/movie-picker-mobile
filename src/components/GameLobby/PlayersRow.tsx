import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Text from "../Text";
import UserAvatar from "../UserAvatar";
import { colors, fontSize, spacing } from "../../constants/design";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

export interface LobbyPlayer {
  id: string;
  name: string;
  isActive?: boolean;
}

interface Props {
  players: LobbyPlayer[];
  waitingLabel: string;
  style?: StyleProp<ViewStyle>
}

export default function PlayersRow({ players, waitingLabel, style }: Props) {
  if (players.length === 0) return null;

  return (
    <View style={[styles.playersRow,style]}>
      <View style={styles.avatarsStack}>
        {players.map((player, index) => (
          <Animated.View key={player.id} entering={FadeIn} style={index > 0 && styles.avatarOverlap}>
            <UserAvatar
              name={player.name}
              size={32}
              borderWidth={2}
              borderColor={colors.appBackground}
              style={{
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
