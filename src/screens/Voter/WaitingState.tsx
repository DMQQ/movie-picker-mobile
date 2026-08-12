import { Dimensions, View } from "react-native";
import Chip from "../../components/Chip";
import Text from "../../components/Text";

import { colors, spacing } from "../../constants/design";
import PrimaryButton from "../../components/PrimaryButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import PageHeading from "../../components/PageHeading";
import QRCodeComponent from "../../components/Voter/QRCode";
import useTranslation from "../../service/useTranslation";

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
  const allReady = users.length > 1 && users.every((u) => u.ready);
  const currentUserReady = users.find((u) => u.userId === currentUserId)?.ready;

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: colors.appBackground }}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <PageHeading
        useSafeArea={false}
        title={(users.length > 1
          ? t("voter.home.ready")
          : t("voter.home.waiting-initial")
        ).slice(0, 30)}
        onPress={onGoBack}
      />

      <View style={{ padding: spacing.screen, flex: 1 }}>
        <Text style={{ marginTop: spacing.xxl * 2 + 2 }}>
          {t("voter.home.waiting")}... ({users.length}/2)
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginVertical: spacing.lg,
            height: 60,
          }}
        >
          {users.map((user) => (
            <Chip
              key={user.userId}
              icon={user.ready ? "check" : "clock"}
              style={[
                { margin: spacing.xs },
                user.userId === currentUserId && {
                  backgroundColor: "#1e88e5",
                },
              ]}
            >
              {user.userId === currentUserId
                ? t("voter.home.you")
                : t("voter.home.user")}
              {user.ready ? ` (${t("voter.home.ready-status")})` : ""}
            </Chip>
          ))}
        </View>

        {sessionId && (
          <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <QRCodeComponent
              sessionId={sessionId}
              type="voter"
              safetyCode="1234"
              size={Dimensions.get("screen").width / 2}
            />
          </View>
        )}
      </View>

      <View
        style={{
          height: 100,
          justifyContent: "flex-end",
          padding: spacing.screen,
        }}
      >
        {!currentUserReady && (
          <PrimaryButton onPress={handleReady} style={{ marginTop: spacing.screen }}>
            {t("voter.home.ready-status")}
          </PrimaryButton>
        )}

        {allReady && isHost && (
          <PrimaryButton
            disabled={loadingInitialContent}
            loading={loadingInitialContent}
            onPress={actions.startSession}
            style={{ marginTop: spacing.screen }}
          >
            {t("voter.home.start")}
          </PrimaryButton>
        )}
      </View>
    </Animated.View>
  );
}
