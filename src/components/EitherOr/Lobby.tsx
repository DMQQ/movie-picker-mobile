import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Text from "../Text";
import PrimaryButton from "../PrimaryButton";
import Button from "../Button";
import PageHeading from "../PageHeading";
import QrCodeBox from "../GameLobby/QrCodeBox";
import PlayersRow from "../GameLobby/PlayersRow";
import LobbyShell from "../GameLobby/LobbyShell";
import useTranslation from "../../service/useTranslation";
import useEitherOrContext from "../../context/EitherOrContext";
import { useAppSelector } from "../../redux/store";
import { colors, fontSize, radius, spacing } from "../../constants/design";
import { router } from "expo-router";

interface Props {
  onGoBack: () => void;
}

export default function Lobby({ onGoBack }: Props) {
  const t = useTranslation();
  const { start } = useEitherOrContext();
  const roomId = useAppSelector((state) => state.eitherOr.roomId);
  const users = useAppSelector((state) => state.eitherOr.users);
  const isHost = useAppSelector((state) => state.eitherOr.isHost);
  const bracketSize = useAppSelector((state) => state.eitherOr.bracketSize);

  return (
    <>
      <PageHeading showGradientBackground={false} useSafeArea={false} title={t("eitherOr.lobby.title")} onPress={onGoBack} />

      <LobbyShell
        bottomContent={
          <>
            <Text style={styles.bracketSizeText}>{t("eitherOr.lobby.bracketSize", { count: bracketSize })}</Text>
            {isHost && (
              <Text style={styles.hostHint}>{t("eitherOr.lobby.host")}</Text>
            )}
            <PlayersRow
              players={users.map((user) => ({ id: user.userId, name: user.username, isActive: user.isActive, isHost: user.isAdmin }))}
              waitingLabel={t("eitherOr.lobby.waitingForHost")}
            />
          </>
        }
        actions={
          <View style={styles.actionRow}>
            <Button
              mode="outlined"
              disabled={!roomId}
              icon="account-multiple-plus"
              compact
              style={styles.inviteButton}
              onPress={() =>
                router.push({
                  pathname: "/invite-players",
                  params: { roomId: roomId, gameType: "either-or" },
                })
              }
            >
              {""}
            </Button>

            {isHost ? (
              <PrimaryButton onPress={start} style={styles.startButton}>
                {t("eitherOr.lobby.start")}
              </PrimaryButton>
            ) : (
              <Text style={{ textAlign: "center", flex: 1 }}>{t("eitherOr.lobby.waitingForHost")}</Text>
            )}
          </View>
        }
      >
        {roomId && (
          <Animated.View entering={FadeInDown} style={{ flex: 1 }}>
            <QrCodeBox code={roomId} scheme="either-or" webPath="either-or" />
          </Animated.View>
        )}
      </LobbyShell>
    </>
  );
}

const styles = StyleSheet.create({
  bracketSizeText: {
    color: colors.placeholder,
    fontSize: fontSize.sm,
  },
  hostHint: {
    color: colors.placeholder,
    fontSize: fontSize.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  inviteButton: {
    borderRadius: radius.pill,
    width: 48,
    height: 48,
  },
  startButton: {
    borderRadius: radius.pill,
    flex: 1,
  },
});
