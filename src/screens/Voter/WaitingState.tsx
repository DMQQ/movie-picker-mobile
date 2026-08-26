import { StyleSheet, View } from "react-native";
import PlayersRow from "../../components/GameLobby/PlayersRow";
import Text from "../../components/Text";

import { colors, fontSize, radius, spacing } from "../../constants/design";
import PrimaryButton from "../../components/PrimaryButton";
import Button from "../../components/Button";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import PageHeading from "../../components/PageHeading";
import QrCodeBox from "../../components/GameLobby/QrCodeBox";
import LobbyShell from "../../components/GameLobby/LobbyShell";
import useTranslation from "../../service/useTranslation";
import { router } from "expo-router";

interface Props {
  users: any[];
  currentUserId: string | null;
  sessionId: string | null;
  isHost: boolean;
  loadingInitialContent: boolean;
  localReady: boolean;
  onGoBack: () => void;
  handleReady: () => void;
  actions: any;
}

export default function WaitingState({
  users,
  currentUserId,
  sessionId,
  isHost,
  loadingInitialContent,
  localReady,
  onGoBack,
  handleReady,
  actions,
}: Props) {
  const t = useTranslation();
  const currentUserReady = users.find((u) => u.userId === currentUserId)?.ready;

  const handleHostStart = () => {
    if (!currentUserReady) handleReady();
    actions.startSession();
  };

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: colors.appBackground }}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <PageHeading useSafeArea={false} title={t("voter.home.ready").slice(0, 30)} onPress={onGoBack} />

      <LobbyShell
        bottomContent={
          <>
            {isHost && (
              <Text style={styles.hostHint}>{t("voter.home.you-are-host")}</Text>
            )}

            <PlayersRow
              players={users.map((user) => ({
                id: user.userId,
                name: user.userId,
                isActive: user.ready,
                isHost: isHost && user.userId === currentUserId,
              }))}
              waitingLabel={t("voter.home.waiting")}
            />
          </>
        }
        actions={
          <>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <Button
                mode="outlined"
                disabled={!sessionId}
                icon="account-multiple-plus"
                compact
                style={{ borderRadius: radius.pill, width: 48, height: 48 }}
                onPress={() =>
                  router.push({
                    pathname: "/invite-players",
                    params: { roomId: sessionId, gameType: "voter" },
                  })
                }
              >
                {""}
              </Button>

              {!isHost && !currentUserReady && (
                <PrimaryButton style={{ flex: 1 }} onPress={handleReady}>{t("voter.home.ready-status")}</PrimaryButton>
              )}

              {isHost && (
                <PrimaryButton style={{ flex: 1 }} disabled={loadingInitialContent} loading={loadingInitialContent} onPress={handleHostStart}>
                  {t("voter.home.start")}
                </PrimaryButton>
              )}
            </View>
          </>
        }
      >
        {sessionId && <QrCodeBox code={sessionId} scheme="voter" webPath="voter" />}
      </LobbyShell>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hostHint: {
    color: colors.placeholder,
    fontSize: fontSize.sm,
  },
});
