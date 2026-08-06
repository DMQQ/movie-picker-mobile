import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import { colors } from "../../constants/design";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMovieVoter } from "../../service/useVoter";
import { url as apiUrl } from "../../context/SocketContext";
import envs from "../../constants/envs";
import useTranslation from "../../service/useTranslation";
import InitialState from "./InitialState";
import WaitingState from "./WaitingState";
import RatingState from "./RatingState";
import Results from "./Results";

export default function Home() {
  const params = useLocalSearchParams();
  const {
    sessionId,
    status,
    users,
    currentMovies,
    currentUserId,
    actions,
    isHost,
    sessionSettings,
    loadingInitialContent,
  } = useMovieVoter();
  const [localReady, setLocalReady] = useState(false);
  const [localRatings, setLocalRatings] = useState<{
    interest: number | null;
    mood: number | null;
    uniqueness: number | null;
  }>({ interest: null, mood: null, uniqueness: null });
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [showError, setShowError] = useState(false);
  const t = useTranslation();

  useEffect(() => {
    if (status !== "waiting") setLocalReady(false);
  }, [status]);

  useEffect(() => {
    const verifyAndJoinSession = async () => {
      if (!params?.sessionId) return;
      try {
        const response = await fetch(
          `${apiUrl}/room/verify/${params.sessionId}`,
          { headers: { authorization: `Bearer ${envs.server_auth_token}` } },
        );
        const data = await response.json();
        if (!data.exists) {
          setShowError(true);
          return;
        }
        actions.setWaiting();
        actions.joinSession(params.sessionId as string).catch((err: Error) => {
          if (err.message === "Session not found") setShowError(true);
        });
      } catch {
        setShowError(true);
      }
    };
    verifyAndJoinSession();
  }, [params?.sessionId]);

  useEffect(() => {
    if (
      localRatings.interest === null ||
      localRatings.mood === null ||
      localRatings.uniqueness === null ||
      !currentMovies?.[0]?.id
    )
      return;

    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      actions.submitRating(currentMovies[0].id as any, {
        interest: localRatings.interest!,
        mood: localRatings.mood!,
        uniqueness: localRatings.uniqueness!,
      });
      setLocalRatings({ interest: null, mood: null, uniqueness: null });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    localRatings.interest,
    localRatings.mood,
    localRatings.uniqueness,
    currentMovies?.[0]?.id,
  ]);

  useEffect(() => {
    if (!currentMovies?.length) return;
    currentMovies.forEach((movie) => {
      if (movie.poster_path)
        Image.prefetch("https://image.tmdb.org/t/p/w342" + movie.poster_path);
      if (movie.backdrop_path)
        Image.prefetch("https://image.tmdb.org/t/p/w500" + movie.backdrop_path);
    });
  }, [currentMovies.map((m) => m.id).join(",")]);

  useEffect(() => {
    if (status === "rating") {
      console.log(
        "[voter:home] currentMovies count:",
        currentMovies.length,
        "card:",
        currentMovies?.[0]?.id ?? "none",
      );
    }
  }, [currentMovies.length, status]);

  const handleReady = () => {
    const newReadyState = !localReady;
    setLocalReady(newReadyState);
    actions.setReady(newReadyState);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  function onGoBack() {
    router.dismissAll();
  }

  return (
    <View style={{ flex: 1 }}>
      {status === "idle" && (
        <InitialState
          sessionSettings={sessionSettings}
          actions={actions}
          onGoBack={onGoBack}
        />
      )}
      {status === "waiting" && (
        <WaitingState
          users={users}
          currentUserId={currentUserId}
          sessionId={sessionId ?? null}
          isHost={isHost}
          loadingInitialContent={loadingInitialContent}
          localReady={localReady}
          onGoBack={onGoBack}
          handleReady={handleReady}
          actions={actions}
        />
      )}
      {status === "rating" && currentMovies !== undefined && (
        <RatingState
          card={currentMovies?.[0]}
          currentMovies={currentMovies}
          insets={insets}
          localRatings={localRatings}
          setLocalRatings={setLocalRatings}
        />
      )}
      {status === "completed" && (
        <View style={{ padding: 15, flex: 1 }}>
          <Results />
        </View>
      )}

      <Portal>
        <Dialog
          dismissable={false}
          visible={showError}
          style={{ backgroundColor: theme.colors.surface, borderRadius: radius.sm + 2 }}
        >
          <Dialog.Title>{t("dialogs.qr.error")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("dialogs.qr.error-desc")}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowError(false);
                router.replace("/(tabs)");
              }}
            >
              {t("dialogs.qr.close")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
