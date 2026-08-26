import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import UserAvatar from "../UserAvatar";
import { colors, fontSize, radius, spacing, withAlpha } from "../../constants/design";
import { StyleProp } from "react-native";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

export interface LobbyPlayer {
  id: string;
  name: string;
  isActive?: boolean;
  isHost?: boolean;
}

interface Props {
  players: LobbyPlayer[];
  waitingLabel: string;
  style?: StyleProp<ViewStyle>;
  showNames?: boolean;
}

function HostCrown({ size = 12, top = -10 }: { size?: number; top?: number }) {
  return (
    <MaterialCommunityIcons
      name="crown"
      size={size}
      color="#FFD700"
      style={[styles.crown, { top, transform: [{ translateX: -size / 2 }] }]}
    />
  );
}

export default function PlayersRow({ players, waitingLabel, style, showNames }: Props) {
  if (players.length === 0) return null;

  if (showNames) {
    return (
      <View style={[styles.chipsRow, style]}>
        {players.map((player) => (
          <Animated.View key={player.id} entering={FadeIn} style={styles.chip}>
            <View>
              {player.isHost && <HostCrown size={10} top={-8} />}
              <UserAvatar
                name={player.name}
                size={24}
                style={{ opacity: player.isActive === false ? 0.4 : 1 }}
              />
            </View>
            <Text style={styles.chipName} numberOfLines={1}>
              {player.name}
            </Text>
          </Animated.View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.playersRow, style]}>
      <View style={styles.avatarsStack}>
        {players.map((player, index) => (
          <Animated.View key={player.id} entering={FadeIn} style={index > 0 && styles.avatarOverlap}>
            {player.isHost && <HostCrown />}
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
    alignSelf: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: withAlpha(colors.text, 0.2),
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
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
  crown: {
    position: "absolute",
    left: "50%",
    zIndex: 10,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.input,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chipName: {
    fontSize: fontSize.sm,
    color: colors.text,
    maxWidth: 80,
  },
});
