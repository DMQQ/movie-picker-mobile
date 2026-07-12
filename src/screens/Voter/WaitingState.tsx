import { ActivityIndicator, Dimensions, View } from "react-native";
import { Button, Chip, MD2DarkTheme, Text } from "react-native-paper";
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
      style={{ flex: 1, backgroundColor: "#000" }}
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
        showGradientBackground={false}
        gradientHeight={50}
      />

      <View style={{ padding: 15, flex: 1 }}>
        <Text style={{ marginTop: 50 }}>
          {t("voter.home.waiting")}... ({users.length}/2)
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginVertical: 16,
            height: 60,
          }}
        >
          {users.map((user) => (
            <Chip
              key={user.userId}
              icon={user.ready ? "check" : "clock"}
              style={[
                { margin: 4 },
                user.userId === currentUserId && {
                  backgroundColor: "#1e88e5",
                },
              ]}
            >
              {user.userId === currentUserId
                ? t("voter.home.you")
                : t("voter.home.user")}
              {user.ready ? " (Ready)" : ""}
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
          padding: 15,
        }}
      >
        {!currentUserReady && (
          <Button
            mode="contained"
            onPress={handleReady}
            style={{ marginTop: 15, borderRadius: 100 }}
            contentStyle={{ padding: 7.5 }}
          >
            {t("voter.home.ready-status")}
          </Button>
        )}

        {allReady && isHost && (
          <Button
            disabled={loadingInitialContent}
            mode="contained"
            onPress={actions.startSession}
            style={[
              { marginTop: 15, borderRadius: 100 },
              {
                backgroundColor: MD2DarkTheme.colors.accent,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            contentStyle={{ padding: 7.5 }}
          >
            {loadingInitialContent && (
              <ActivityIndicator
                style={{ marginHorizontal: 10 }}
                size={15}
                color="#fff"
              />
            )}
            {t("voter.home.start")}
          </Button>
        )}
      </View>
    </Animated.View>
  );
}
