import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Chip, IconButton, MD2DarkTheme, Text, TouchableRipple, Dialog, Portal, useTheme } from "react-native-paper";
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown } from "react-native-reanimated";
import { FancySpinner } from "../../components/FancySpinner";
import QuickActions from "../../components/QuickActions";
import QRCodeComponent from "../../components/Voter/QRCode";
import useTranslation from "../../service/useTranslation";
import { useMovieVoter } from "../../service/useVoter";

import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native-gesture-handler";
import PageHeading from "../../components/PageHeading";
import { useGetAllProvidersQuery, useGetGenresQuery } from "../../redux/movie/movieApi";
import ReviewManager from "../../utils/rate";
import { throttle } from "../../utils/throttle";
import { url as apiUrl } from "../../context/SocketContext";
import envs from "../../constants/envs";

const scaleTitle = (title: string, size = 30) => {
  if (title.length > 30) return size * 0.75;

  if (title.length > 20) return size * 0.85;

  return size;
};

import { useLocalSearchParams } from "expo-router";

export default function Home() {
  const params = useLocalSearchParams();
  const { sessionId, status, users, currentMovies, currentUserId, actions, isHost, sessionSettings, loadingInitialContent } =
    useMovieVoter();
  const [localReady, setLocalReady] = useState(false);
  const [localRatings, setLocalRatings] = useState<{
    interest: number | null;
    mood: number | null;
    uniqueness: number | null;
  }>({
    interest: null,
    mood: null,
    uniqueness: null,
  });
  const theme = useTheme();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (status !== "waiting") {
      setLocalReady(false);
    }
  }, [status]);

  useEffect(() => {
    const verifyAndJoinSession = async () => {
      if (params?.sessionId) {
        try {
          const response = await fetch(`${apiUrl}/room/verify/${params.sessionId}`, {
            headers: {
              authorization: `Bearer ${envs.server_auth_token}`,
            },
          });

          const data = await response.json();

          if (!data.exists) {
            setShowError(true);
            return;
          }

          actions.setWaiting();
          actions.joinSession(params.sessionId as string).catch((err) => {
            if (err.message === "Session not found") {
              setShowError(true);
            }
          });
        } catch (error) {
          console.error("Failed to verify session:", error);
          setShowError(true);
        }
      }
    };

    verifyAndJoinSession();
  }, [params?.sessionId]);

  const handleSubmitRating = useCallback(
    throttle(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (currentMovies?.[0]?.id && localRatings.interest !== null && localRatings.mood !== null && localRatings.uniqueness !== null) {
        actions.submitRating(currentMovies[0].id as any, {
          interest: localRatings.interest,
          mood: localRatings.mood,
          uniqueness: localRatings.uniqueness,
        });

        setLocalRatings({
          interest: null,
          mood: null,
          uniqueness: null,
        });
      }
    }, 1000),
    [currentMovies, localRatings, actions],
  );

  const handleReady = () => {
    const newReadyState = !localReady;
    setLocalReady(newReadyState);
    actions.setReady(newReadyState);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const imagesPrefetched = useRef(false);
  useEffect(() => {
    if (currentMovies?.length === 0 || imagesPrefetched.current) return;

    Promise.any(
      currentMovies
        .map((movie) => [
          Image.prefetch("https://image.tmdb.org/t/p/w200" + movie.poster_path),
          Image.prefetch("https://image.tmdb.org/t/p/w500" + movie?.backdrop_path),
        ])
        .flat(),
    ).finally(() => {
      imagesPrefetched.current = true;
    });
  }, [currentMovies.length]);

  const t = useTranslation();

  function onGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/games");
    }
  }

  const renderInitialState = () => (
    <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
      <PageHeading gradientHeight={50} useSafeArea={false} title={t("voter.home.howtotitle")} onPress={onGoBack} />
      <View style={{ flex: 1, paddingHorizontal: 15, paddingBottom: 15, paddingTop: 60 }}>
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 18 }}>{t("voter.home.howto")}</Text>
          </View>
          <PickCategory
            category={sessionSettings.category}
            setCategory={(category: string) => {
              actions.setSessionSettings((p) => ({ ...p, category }) as any);
            }}
          />
          <PickGenres
            genres={sessionSettings.genres}
            setGenres={(genres: any) => {
              actions.setSessionSettings((p) => ({ ...p, genres: genres(p.genres) }));
            }}
          />
          <PickProviders
            setProviders={(providers: any) => {
              actions.setSessionSettings((p) => ({
                ...p,
                providers: providers(p.providers),
              }));
            }}
            providers={sessionSettings.providers}
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: 15, paddingTop: 15 }}>
        <Button mode="contained" onPress={actions.createSession} style={[styles.button, { marginTop: 0 }]} contentStyle={{ padding: 7.5 }}>
          {t("voter.home.create")}
        </Button>
      </View>
    </Animated.View>
  );

  const renderWaitingState = () => {
    const allReady = users.length > 1 && users.every((u) => u.ready);
    const currentUserReady = users.find((u) => u.userId === currentUserId)?.ready;

    return (
      <Animated.View style={{ flex: 1, backgroundColor: "#000" }} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
        <PageHeading
          useSafeArea={false}
          title={users.length > 1 ? t("voter.home.ready") : t("voter.home.waiting-initial")}
          onPress={onGoBack}
          showGradientBackground={false}
          gradientHeight={50}
        />

        <View style={{ padding: 15, flex: 1 }}>
          <Text style={{ marginTop: 50 }}>
            {t("voter.home.waiting")}... ({users.length}/2)
          </Text>
          <View style={styles.usersContainer}>
            {users.map((user) => (
              <Chip
                key={user.userId}
                icon={user.ready ? "check" : "clock"}
                style={[styles.userChip, user.userId === currentUserId && styles.currentUserChip]}
              >
                {user.userId === currentUserId ? t("voter.home.you") : t("voter.home.user")}
                {user.ready ? " (Ready)" : ""}
              </Chip>
            ))}
          </View>

          {sessionId && (
            <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
              <QRCodeComponent sessionId={sessionId} type="voter" safetyCode="1234" size={Dimensions.get("screen").width / 2} />
            </View>
          )}
        </View>
        <View style={{ height: 100, justifyContent: "flex-end", paddingHorizontal: 15, paddingTop: 15 }}>
          {!currentUserReady && (
            <Button mode="contained" onPress={handleReady} style={styles.button} contentStyle={{ padding: 7.5 }}>
              {t("voter.home.ready-status")}
            </Button>
          )}

          {allReady && isHost && (
            <Button
              disabled={loadingInitialContent}
              mode="contained"
              onPress={actions.startSession}
              style={[
                styles.button,
                {
                  backgroundColor: MD2DarkTheme.colors.accent,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              contentStyle={{
                padding: 7.5,
              }}
            >
              {loadingInitialContent && <ActivityIndicator style={{ marginHorizontal: 10 }} size={15} color="#fff" />}
              {t("voter.home.start")}
            </Button>
          )}
        </View>
      </Animated.View>
    );
  };

  const card = currentMovies?.[0];

  const renderRatingState = () =>
    card ? (
      <Animated.View style={[{ flex: 1 }]} key={card.id} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
        <ImageBackground
          blurRadius={5}
          source={{
            uri: "https://image.tmdb.org/t/p/w500" + card?.backdrop_path,
          }}
          style={{ flex: 1, ...StyleSheet.absoluteFillObject }}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}>
            <View style={{ padding: 5, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 30, fontFamily: "Bebas" }}>{t("voter.home.rate")} 🎬</Text>

              <Text style={{ fontFamily: "Bebas", fontSize: 20 }}>
                {currentMovies.length} {t("voter.home.left")}
              </Text>
            </View>
            <View style={{ flex: 1, marginTop: 10, paddingHorizontal: 15 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  disabled={typeof card?.id === "undefined"}
                  activeOpacity={0.9}
                  onPress={() => {
                    router.push({
                      pathname: "/movie/type/[type]/[id]",
                      params: {
                        id: card?.id,
                        type: card?.title ? "movie" : "tv",
                        img: card?.poster_path,
                      },
                    });
                  }}
                  style={{ borderRadius: 10, overflow: "hidden" }}
                >
                  <Animated.Image
                    entering={FadeInDown.duration(300)}
                    exiting={FadeOutDown.duration(300)}
                    source={{ uri: "https://image.tmdb.org/t/p/w200" + card?.poster_path }}
                    style={{
                      width: (Dimensions.get("window").width - 30) / 2 - 50,
                      height: 210,
                      borderRadius: 10,
                    }}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1, gap: 10, justifyContent: "space-between" }}>
                  <View>
                    <Text
                      style={{
                        fontSize: scaleTitle((card?.title || card?.name)! as string, 40),
                        fontFamily: "Bebas",
                      }}
                    >
                      {card?.title || card?.name}
                    </Text>

                    <Text style={{ width: "100%" }}>
                      ★{card?.vote_average.toFixed(2)} / 10{" "}
                      {[card?.release_date, `(${card?.original_language.toUpperCase()})`].filter((v) => v !== undefined).join(" | ")}
                    </Text>
                  </View>

                  <View style={{ width: "100%" }}>
                    <QuickActions movie={card}>
                      <View style={{ height: 100 }} />
                    </QuickActions>
                  </View>
                </View>
              </View>
              <Animated.Text
                entering={FadeInDown}
                exiting={FadeOutDown}
                numberOfLines={9}
                style={{ marginTop: 10, color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "500" }}
              >
                {card?.overview}
              </Animated.Text>
            </View>

            <View style={{ flex: 1, marginTop: 30, justifyContent: "space-between" }}>
              <Text style={{ fontSize: 30, fontFamily: "Bebas", paddingHorizontal: 15 }}>{t("voter.rate")}</Text>

              <View style={{ gap: 8, marginTop: 15, paddingHorizontal: 15 }}>
                <Text style={{ fontSize: 18, fontFamily: "Bebas" }}>{t("voter.ratings.interest.label")}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[
                    { value: 0, label: t("voter.ratings.interest.options.0") },
                    { value: 1, label: t("voter.ratings.interest.options.1") },
                    { value: 2, label: t("voter.ratings.interest.options.2") },
                  ].map((option) => {
                    const isSelected = localRatings.interest === option.value;
                    return (
                      <Button
                        key={option.value}
                        mode={isSelected ? "contained" : "outlined"}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLocalRatings((p) => ({ ...p, interest: option.value }));
                        }}
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          backgroundColor: isSelected ? MD2DarkTheme.colors.primary : "rgba(0,0,0,0.5)",
                        }}
                        labelStyle={{ fontSize: 12, color: "#fff" }}
                        compact
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </View>
              </View>

              <View style={{ gap: 8, marginTop: 15, paddingHorizontal: 15 }}>
                <Text style={{ fontSize: 18, fontFamily: "Bebas" }}>{t("voter.ratings.mood.label")}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[
                    { value: 0, label: t("voter.ratings.mood.options.0") },
                    { value: 1, label: t("voter.ratings.mood.options.1") },
                    { value: 2, label: t("voter.ratings.mood.options.2") },
                  ].map((option) => {
                    const isSelected = localRatings.mood === option.value;
                    return (
                      <Button
                        key={option.value}
                        mode={isSelected ? "contained" : "outlined"}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLocalRatings((p) => ({ ...p, mood: option.value }));
                        }}
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          backgroundColor: isSelected ? MD2DarkTheme.colors.primary : "rgba(0,0,0,0.5)",
                        }}
                        labelStyle={{ fontSize: 12, color: "#fff" }}
                        compact
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </View>
              </View>

              <View style={{ gap: 8, marginTop: 15, paddingHorizontal: 15 }}>
                <Text style={{ fontSize: 18, fontFamily: "Bebas" }}>{t("voter.ratings.novelty.label")}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[
                    { value: 0, label: t("voter.ratings.novelty.options.0") },
                    { value: 1, label: t("voter.ratings.novelty.options.1") },
                    { value: 2, label: t("voter.ratings.novelty.options.2") },
                  ].map((option) => {
                    const isSelected = localRatings.uniqueness === option.value;
                    return (
                      <Button
                        key={option.value}
                        mode={isSelected ? "contained" : "outlined"}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLocalRatings((p) => ({ ...p, uniqueness: option.value }));
                        }}
                        style={{
                          flex: 1,
                          borderRadius: 10,
                          backgroundColor: isSelected ? MD2DarkTheme.colors.primary : "rgba(0,0,0,0.5)",
                        }}
                        labelStyle={{ fontSize: 12, color: "#fff" }}
                        compact
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </View>
              </View>

              <View style={{ width: "100%", backgroundColor: "#000", paddingHorizontal: 15 }}>
                <Button
                  onPress={handleSubmitRating}
                  mode="contained"
                  disabled={localRatings.interest === null || localRatings.mood === null || localRatings.uniqueness === null}
                  style={styles.button}
                  contentStyle={{ padding: 10 }}
                >
                  {t("voter.ratings.submit")}
                </Button>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    ) : (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 15 }}>
        <FancySpinner />

        <Text>{t("voter.home.waiting")}</Text>
      </View>
    );

  const renderCompletedState = () => (
    <View style={styles.section}>
      <Results />
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === "android" ? 30 : 0 }}>
      {status === "idle" && renderInitialState()}
      {status === "waiting" && renderWaitingState()}
      {status === "rating" && currentMovies !== undefined && renderRatingState()}
      {status === "completed" && renderCompletedState()}

      <Portal>
        <Dialog dismissable={false} visible={showError} style={{ backgroundColor: theme.colors.surface, borderRadius: 10 }}>
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

function Results() {
  const { sessionResults, currentUserId } = useMovieVoter();
  const t = useTranslation();

  if (!sessionResults) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.center}>
          <Text>Loading results...</Text>
        </View>
      </View>
    );
  }

  if (!sessionResults.topPicks.length) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.center}>
          <Text>No movies matched your preferences</Text>
          <Button mode="contained" onPress={() => router.replace("/")} style={styles.button}>
            {t("voter.home.quit")}
          </Button>
        </View>
      </View>
    );
  }

  const card = sessionResults?.selectedMovie;

  return (
    <ImageBackground
      blurRadius={5}
      source={{
        uri: "https://image.tmdb.org/t/p/w500" + card?.backdrop_path,
      }}
      style={{ flex: 1, ...StyleSheet.absoluteFillObject }}
    >
      <View
        style={{
          padding: 10,
          height: 80,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <IconButton
          style={{ position: "absolute", left: 10, top: 10, zIndex: 100 }}
          icon="chevron-left"
          onPress={() => router.replace("/games")}
          size={28}
        />
        <Text style={{ fontSize: 30, fontFamily: "Bebas", width: "100%", textAlign: "center" }}>{t("voter.overview.title")} 🎬</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 15, paddingBottom: 15 }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", gap: 15 }}>
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/movie/type/[type]/[id]",
                  params: {
                    id: card?.id,
                    type: card?.title ? "movie" : "tv",
                    img: card?.poster_path,
                  },
                });
              }}
            >
              <Image
                source={{ uri: "https://image.tmdb.org/t/p/w500" + card?.poster_path }}
                style={{
                  width: (Dimensions.get("window").width - 30) / 2 - 60,
                  height: 215,
                  borderRadius: 10,
                }}
              />
            </Pressable>
            <View style={{ flex: 1, gap: 10, justifyContent: "space-between", paddingVertical: 15 }}>
              <Text
                style={{
                  fontSize: scaleTitle((card?.title || card?.name)! as string, 30),
                  fontFamily: "Bebas",
                }}
              >
                {card?.title || card?.name}
              </Text>
              <Text style={{ width: "100%", marginBottom: 10 }}>
                ★{card?.vote_average.toFixed(2)}/10 {card?.release_date} | {card?.original_language}
              </Text>

              {card && <QuickActions movie={card} />}
            </View>
          </View>
          <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "500" }}>{card?.overview}</Text>

          <View style={{ marginTop: 30 }}>
            <Text style={{ fontSize: 30, fontFamily: "Bebas", marginBottom: 15 }}>{t("voter.overview.h2")}</Text>
            {sessionResults?.topPicks?.slice(1).map((item) => (
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!item.movie.id}
                key={item.movie.id}
                style={{ marginBottom: 15, width: Dimensions.get("screen").width - 30, overflow: "hidden" }}
                onPress={() => {
                  router.push({
                    pathname: "/movie/type/[type]/[id]",
                    params: {
                      id: item.movie.id,
                      type: item?.movie?.title ? "movie" : "tv",
                      img: item.movie.poster_path,
                    },
                  });
                }}
              >
                <View style={{ flexDirection: "row", gap: 15 }}>
                  <Image
                    source={{ uri: "https://image.tmdb.org/t/p/w200" + item.movie.poster_path }}
                    style={{
                      width: 80,
                      height: 120,
                      borderRadius: 5,
                    }}
                  />
                  <View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", height: 45 }}
                    >
                      <Text
                        style={{
                          fontSize: 30,
                          fontFamily: "Bebas",
                        }}
                      >
                        {item?.movie?.title || item?.movie?.name}
                      </Text>
                    </View>
                    <View>
                      <Text>★ {item.movie.vote_average.toFixed(2)}/10 </Text>

                      <Text numberOfLines={3} textBreakStrategy="simple">
                        {item.movie.release_date} | {item.movie.original_language} | {item?.movie?.overview}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => {
            ReviewManager.onGameComplete(true);
            router.replace("/");
          }}
          style={[styles.button, { marginBottom: 15 }]}
          contentStyle={{ padding: 7.5 }}
        >
          {t("voter.home.quit")}
        </Button>
      </ScrollView>
    </ImageBackground>
  );
}

const PickGenres = ({ genres, setGenres }: { genres: number[]; setGenres: any }) => {
  const { data: movies } = useGetGenresQuery({ type: "movie" });
  const { data: tv } = useGetGenresQuery({ type: "tv" });

  const combined = useMemo(() => {
    if (!movies?.length && !tv?.length) return [];

    const genresMap = new Map();

    movies?.forEach((genre) => {
      genresMap.set(genre.id, { ...genre, types: ["movie"] });
    });

    tv?.forEach((genre) => {
      if (genresMap.has(genre.id)) {
        const existing = genresMap.get(genre.id);
        genresMap.set(genre.id, {
          ...existing,
          types: [...existing.types, "tv"],
        });
      } else {
        genresMap.set(genre.id, { ...genre, types: ["tv"] });
      }
    });

    return Array.from(genresMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [movies?.length, tv?.length]);

  if (!combined.length) return null;

  return (
    <View style={{ marginVertical: 15 }}>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        data={combined}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <Button
            onPress={() => {
              setGenres((p: number[]) => (p.includes(item.id) ? p.filter((i) => i !== item.id) : [...p, item.id]));
            }}
            mode={genres.includes(item.id) ? "contained" : "outlined"}
            style={{ borderRadius: 10, marginRight: 15, height: 35 }}
          >
            {item.name}
          </Button>
        )}
      />
    </View>
  );
};

const PickCategory = ({ setCategory, category }: { setCategory: any; category: string }) => {
  const t = useTranslation();

  const categories = useMemo(() => {
    return [
      {
        label: t("voter.types.movie"),
        value: "movie",
      },
      {
        label: t("voter.types.series"),
        value: "Series",
      },
      {
        label: t("voter.types.mixed"),
        value: "Mixed",
      },
    ];
  }, []);

  return (
    <View style={{ flexDirection: "row", paddingVertical: 10, gap: 15, marginTop: 15 }}>
      {categories.map((item, index) => (
        <Button
          key={index}
          onPress={() => {
            setCategory(item.value);
          }}
          mode={category === item.value ? "contained" : "outlined"}
          style={{ flex: 1, borderRadius: 10 }}
        >
          {item.label}
        </Button>
      ))}
    </View>
  );
};

const PickProviders = ({ providers, setProviders }: { setProviders: any; providers: number[] }) => {
  const { data } = useGetAllProvidersQuery({});
  // Calculate margins and container padding
  const MARGIN = 8;
  const CONTAINER_PADDING = 16;
  const NUM_COLUMNS = 5;

  // Calculate size accounting for all spacing
  const totalHorizontalPadding = CONTAINER_PADDING * 2;
  const totalMargins = MARGIN * (NUM_COLUMNS - 1);
  const size = Math.floor((Dimensions.get("screen").width - totalHorizontalPadding - totalMargins) / NUM_COLUMNS);

  return (
    <FlatList
      style={{
        marginTop: 15,
        paddingHorizontal: CONTAINER_PADDING,
      }}
      contentContainerStyle={{
        alignItems: "center",
      }}
      numColumns={NUM_COLUMNS}
      keyExtractor={(i) => i.provider_id.toString()}
      data={data}
      renderItem={({ item }) => (
        <TouchableRipple
          onPress={() =>
            setProviders((p: number[]) =>
              p.includes(item.provider_id) ? p.filter((i) => i !== item.provider_id) : [...p, item.provider_id],
            )
          }
          style={{
            borderWidth: 2,
            borderColor: providers.includes(item.provider_id) ? MD2DarkTheme.colors.primary : "transparent",
            borderRadius: 10,
            margin: MARGIN / 2,
            width: size,
            height: size,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w200${item?.logo_path}` }}
            style={{
              width: size - 4, // Account for border width
              height: size - 4,
              borderRadius: 7.5,
            }}
            resizeMode="contain"
          />
        </TouchableRipple>
      )}
    />
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 15,
    flex: 1,
  },
  button: {
    marginTop: 15,
    borderRadius: 100,
  },
  joinSection: {
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: "red",
    padding: 16,
  },
  usersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 16,
    height: 60,
  },
  userChip: {
    margin: 4,
  },
  currentUserChip: {
    backgroundColor: "#1e88e5",
  },
  movieCard: {
    marginVertical: 8,
  },
  modal: {
    backgroundColor: MD2DarkTheme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  ratingContainer: {
    marginVertical: 16,
    gap: 12,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  overview: {
    marginVertical: 8,
  },
  scoresContainer: {
    marginTop: 16,
  },
  progressBar: {
    marginVertical: 8,
    height: 8,
    borderRadius: 4,
  },
});
