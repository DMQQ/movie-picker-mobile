import { View, StyleSheet, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import FormSheetContainer from "../components/FormSheetContainer";
import GameCard from "../components/GameCard";
import PlayersRow, { LobbyPlayer } from "../components/GameLobby/PlayersRow";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { partyActions, PartyGameMode } from "../redux/party/partySlice";
import { colors, spacing } from "../constants/design";
import { posthog } from "../constants/posthog";
import useTranslation from "../service/useTranslation";

interface Mode {
  key: PartyGameMode;
  titleKey: string;
  descriptionKey: string;
  animationIndex: number;
  badgeColor: string;
}

const MODES: Mode[] = [
  {
    key: "swipe",
    titleKey: "games.voter.swipe",
    descriptionKey: "games.voter.swipeDescription",
    animationIndex: 0,
    badgeColor: colors.primary,
  },
  {
    key: "voter",
    titleKey: "games.voter.title",
    descriptionKey: "games.voter.description",
    animationIndex: 1,
    badgeColor: "#E5A830",
  },
  {
    key: "either-or",
    titleKey: "games.eitherOr.title",
    descriptionKey: "games.eitherOr.description",
    animationIndex: 4,
    badgeColor: colors.error,
  },
];

export default function PlayAgain() {
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const roomUsers = useAppSelector((st) => st.room.users);
  const partyMembers = useAppSelector((st) => st.party.members);
  const partyHost = useAppSelector((st) => st.party.host);
  // Room users are plain nicks — the server lists the host first, so index 0 gets the crown.
  const players: LobbyPlayer[] =
    roomUsers.length > 0
      ? roomUsers.map((nick, index) => ({ id: nick, name: nick, isHost: index === 0 }))
      : partyMembers.map((m) => ({
          id: m.userId,
          name: m.nickname,
          isHost: m.userId === partyHost,
        }));
  const visibleModes = MODES.map((mode) => ({
    ...mode,
    title: t(mode.titleKey),
    description: t(mode.descriptionKey),
  }));

  const handleSelect = (mode: PartyGameMode) => {
    posthog?.capture("play_again_mode_selected", { mode, from: from ?? null });
    dispatch(partyActions.setNextGame(mode));
    router.back();
  };

  return (
    <FormSheetContainer title={t("game-summary.play-again")} style={{paddingBottom:0}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <PlayersRow
          players={players}
          waitingLabel={t("room.waiting-for-players")}
          showNames
          style={styles.playersRow}
        />

        <View style={styles.cards}>
          {visibleModes.map((mode) => (
            <GameCard
              key={mode.key}
              small
              title={mode.title}
              description={mode.description}
              index={mode.animationIndex}
              badgeColor={mode.badgeColor}
              featured={false}
              onPress={() => handleSelect(mode.key)}
            />
          ))}
        </View>
      </ScrollView>
    </FormSheetContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  playersRow: {
    paddingHorizontal: spacing.xs,
  },
  cards: {
    gap: spacing.md,
  },
});
