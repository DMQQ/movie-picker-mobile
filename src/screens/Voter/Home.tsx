import { useEffect, useRef, useState } from "react";
import Dialog from "../../components/Dialog";
import Portal from "../../components/Portal";
import Text from "../../components/Text";
import { useTheme } from "../../hooks/useTheme";
import { Image, View } from "react-native";

import Button from "../../components/Button";
import { radius } from "../../constants/design";
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
  const cardStartTime = useRef(Date.now());
  const submittedRef = useRef(false);
  const localRatingsRef = useRef(localRatings);
  localRatingsRef.current = localRatings;
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
    cardStartTime.current = Date.now();
    submittedRef.current = false;
    setLocalRatings({ interest: null, mood: null, uniqueness: null });
  }, [currentMovies?.[0]?.id]);

  useEffect(() => {
    if (
      localRatings.interest === null ||
      localRatings.mood === null ||
      localRatings.uniqueness === null ||
      !currentMovies?.[0]?.id
    )
      return;

    const timer = setTimeout(() => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      actions.submitRating(currentMovies[0].id as any, {
        interest: localRatings.interest!,
        mood: localRatings.mood!,
        uniqueness: localRatings.uniqueness!,
        durationMs: Date.now() - cardStartTime.current - 500,
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

  const handleTimeout = () => {
    if (submittedRef.current || !currentMovies?.[0]?.id) return;
    submittedRef.current = true;
    const r = localRatingsRef.current;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    actions.submitRating(currentMovies[0].id as any, {
      interest: r.interest ?? 1,
      mood: r.mood ?? 1,
      uniqueness: r.uniqueness ?? 1,
      durationMs: Date.now() - cardStartTime.current,
    });
    setLocalRatings({ interest: null, mood: null, uniqueness: null });
  };

  useEffect(() => {
    if (!currentMovies?.length) return;
    currentMovies.forEach((movie) => {
      if (movie.poster_path)
        Image.prefetch("https://image.tmdb.org/t/p/w500" + movie.poster_path);
      if (movie.backdrop_path)
        Image.prefetch("https://image.tmdb.org/t/p/w500" + movie.backdrop_path);
    });
  }, [currentMovies.map((m) => m.id).join(",")]);


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
          onTimeout={handleTimeout}
        />
      )}
      {status === "completed" && (
        <View style={{ flex: 1 }}>
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
                router.back();
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
