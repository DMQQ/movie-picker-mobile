import { StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Text from "../Text";
import PrimaryButton from "../PrimaryButton";
import PageHeading from "../PageHeading";
import QrCodeBox from "../GameLobby/QrCodeBox";
import PlayersRow from "../GameLobby/PlayersRow";
import LobbyShell from "../GameLobby/LobbyShell";
import useTranslation from "../../service/useTranslation";
import useEitherOrContext from "../../context/EitherOrContext";
import { useAppSelector } from "../../redux/store";
import { colors, fontSize, radius } from "../../constants/design";

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
            <PlayersRow
              players={users.map((user) => ({ id: user.userId, name: user.username, isActive: user.isActive }))}
              waitingLabel={t("eitherOr.lobby.waitingForHost")}
            />
          </>
        }
        actions={
          isHost ? (
            <PrimaryButton onPress={start} style={styles.startButton}>
              {t("eitherOr.lobby.start")}
            </PrimaryButton>
          ) : (
            <Text style={{ textAlign: "center" }}>{t("eitherOr.lobby.waitingForHost")}</Text>
          )
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
  startButton: {
    borderRadius: radius.pill,
  },
});
