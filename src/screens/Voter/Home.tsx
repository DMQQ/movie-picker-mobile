import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, StyleSheet, Dimensions, ImageBackground, Image } from "react-native";
import { Button, Text, Chip, MD2DarkTheme, TouchableRipple, IconButton } from "react-native-paper";
import SafeIOSContainer from "../../components/SafeIOSContainer";
import { useMovieVoter } from "../../service/useVoter";
import RangeSlider from "../../components/RangeSlidePicker";
import Animated from "react-native-reanimated";
import CustomFavourite from "../../components/Favourite";
import QRCodeComponent from "../../components/Voter/QRCode";
import { FancySpinner } from "../../components/FancySpinner";
import useTranslation from "../../service/useTranslation";

export default function Home({ navigation, route }: any) {
  const { sessionId, status, users, currentMovies, currentUserId, actions, isHost } = useMovieVoter();
  const [localReady, setLocalReady] = useState(false);
  const [localRatings, setLocalRatings] = useState({
    interest: 2,
    mood: 1,
    uniqueness: 2,
  });

  useEffect(() => {
    if (status !== "waiting") {
      setLocalReady(false);
    }
  }, [status]);

  useEffect(() => {
    if (route?.params?.sessionId) {
      console.log("Joining session ", route?.params?.sessionId);
      actions.joinSession(route?.params?.sessionId);
    }
  }, [route?.params?.sessionId]);

  const handleSubmitRating = useCallback(() => {
    if (currentMovies?.[0]?.id) {
      actions.submitRating(currentMovies[0].id as any, localRatings);

      setLocalRatings({
        interest: 2,
        mood: 1,
        uniqueness: 2,
      });
    }
  }, [currentMovies, localRatings, actions]);

  const handleReady = () => {
    const newReadyState = !localReady;
    setLocalReady(newReadyState);
    actions.setReady(newReadyState);
  };

  const t = useTranslation();

  const renderInitialState = () => (
    <Animated.View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={35} />
        <Text style={{ fontSize: 35, fontFamily: "Bebas", textAlign: "center", width: "70%" }}>{t("voter.home.title")}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: "space-between", padding: 15 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 35, fontFamily: "Bebas", marginBottom: 15 }}>{t("voter.home.howtotitle")}</Text>
            <Text style={{ fontSize: 18 }}>{t("voter.home.howto")}</Text>
          </View>
        </View>

        <Button mode="contained" onPress={actions.createSession} style={styles.button} contentStyle={{ padding: 7.5 }}>
          {t("voter.home.create")}
        </Button>
      </View>
    </Animated.View>
  );

  const renderWaitingState = () => {
    const allReady = users.length > 1 && users.every((u) => u.ready);
    const currentUserReady = users.find((u) => u.userId === currentUserId)?.ready;

    return (
      <Animated.View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <IconButton icon="chevron-left" onPress={() => navigation.navigate("Landing")} size={35} />
          <Text style={{ fontSize: 33, fontFamily: "Bebas", width: "70%" }}>
            {users.length > 1 ? t("voter.home.ready") : t("voter.home.waiting-initial")}
          </Text>
        </View>

        <View style={{ padding: 15, flex: 1 }}>
          <Text>
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
              <Text style={{ fontSize: 30, letterSpacing: 3, fontFamily: "Bebas", color: MD2DarkTheme.colors.primary, marginTop: 10 }}>
                {sessionId}
              </Text>
            </View>
          )}

          <Button mode="contained" onPress={handleReady} style={styles.button} contentStyle={{ padding: 7.5 }}>
            {currentUserReady ? t("voter.home.ready-cancel") : t("voter.home.ready-status")}
          </Button>

          {allReady && isHost && (
            <Button
              mode="contained"
              onPress={actions.startSession}
              style={[
                styles.button,
                {
                  backgroundColor: MD2DarkTheme.colors.accent,
                },
              ]}
              contentStyle={{
                padding: 7.5,
              }}
            >
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
      <ImageBackground
        blurRadius={5}
        source={{
          uri: "https://image.tmdb.org/t/p/w500" + card?.backdrop_path,
        }}
        style={{ flex: 1, ...StyleSheet.absoluteFillObject }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 15, paddingBottom: 15 }}>
          <View style={{ padding: 5, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 40, fontFamily: "Bebas" }}>{t("voter.home.rate")} 🎬</Text>

            <Text style={{ fontFamily: "Bebas", fontSize: 20 }}>
              {currentMovies.length} {t("voter.home.left")}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", gap: 15 }}>
              <Image
                source={{ uri: "https://image.tmdb.org/t/p/w500" + card?.poster_path }}
                style={{
                  width: (Dimensions.get("window").width - 30) / 2 - 60,
                  height: 215,
                  borderRadius: 10,
                }}
              />
              <View style={{ flex: 1, gap: 10, justifyContent: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 35,
                    fontFamily: "Bebas",
                  }}
                >
                  {card?.title || card?.name}
                </Text>
                <Text style={{ width: "100%" }}>★{card?.vote_average.toFixed(2)}/10 </Text>

                <Text style={{ width: "100%" }}>
                  {card?.release_date} | {card?.original_language}
                </Text>

                <CustomFavourite movie={card} />
              </View>
            </View>
            <Text numberOfLines={9} style={{ marginTop: 10, color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "500" }}>
              {card?.overview}
            </Text>
          </View>

          <View style={{ flex: 1, marginTop: 30, justifyContent: "space-between" }}>
            <Text style={{ fontSize: 30, fontFamily: "Bebas" }}>{t("voter.rate")}</Text>

            <View style={{ gap: 10, marginTop: 15, height: 60 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Bebas",
                }}
              >
                {t("voter.ratings.interest.label")}: (
                {
                  [
                    t("voter.ratings.interest.options.1"),
                    t("voter.ratings.interest.options.2"),
                    t("voter.ratings.interest.options.3"),
                    t("voter.ratings.interest.options.4"),
                    t("voter.ratings.interest.options.5"),
                  ][localRatings.interest]
                }
                )
              </Text>
              <RangeSlider
                value={localRatings.interest}
                width={Dimensions.get("window").width - 30}
                steps={5}
                barHeight={30}
                barStyle={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                handleSize={30}
                handleStyle={{ backgroundColor: MD2DarkTheme.colors.primary }}
                onChange={(value) => setLocalRatings((p) => ({ ...p, interest: value }))}
              />
            </View>

            <View style={{ gap: 10, marginTop: 15, height: 60 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Bebas",
                }}
              >
                {t("voter.ratings.mood.label")}: (
                {
                  [t("voter.ratings.mood.options.1"), t("voter.ratings.mood.options.2"), t("voter.ratings.mood.options.3")][
                    localRatings.mood
                  ]
                }
                )
              </Text>
              <RangeSlider
                value={localRatings.mood}
                width={Dimensions.get("window").width - 30}
                steps={3}
                barHeight={30}
                barStyle={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                handleSize={30}
                handleStyle={{ backgroundColor: MD2DarkTheme.colors.primary }}
                onChange={(value) => setLocalRatings((p) => ({ ...p, mood: value }))}
              />
            </View>

            <View style={{ gap: 10, marginTop: 15, height: 60 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Bebas",
                }}
              >
                {t("voter.ratings.uniqueness.label")}: (
                {
                  [
                    t("voter.ratings.uniqueness.options.1"),
                    t("voter.ratings.uniqueness.options.2"),
                    t("voter.ratings.uniqueness.options.3"),
                    t("voter.ratings.uniqueness.options.4"),
                    t("voter.ratings.uniqueness.options.5"),
                  ][localRatings.uniqueness]
                }
                )
              </Text>
              <RangeSlider
                value={localRatings.uniqueness}
                width={Dimensions.get("window").width - 30}
                steps={5}
                barHeight={30}
                barStyle={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                handleSize={30}
                handleStyle={{ backgroundColor: MD2DarkTheme.colors.primary }}
                onChange={(value) => setLocalRatings((p) => ({ ...p, uniqueness: value }))}
              />
            </View>

            <Button onPress={handleSubmitRating} mode="contained" style={styles.button} contentStyle={{ padding: 10 }}>
              {t("voter.ratings.submit")}
            </Button>
          </View>
        </View>
      </ImageBackground>
    ) : (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
        <FancySpinner />

        <Text>{t("voter.home.waiting")}</Text>
      </View>
    );

  const renderCompletedState = () => (
    <View style={styles.section}>
      <Results navigation={navigation} />
    </View>
  );

  return (
    <SafeIOSContainer>
      {status === "idle" && renderInitialState()}
      {status === "waiting" && renderWaitingState()}
      {status === "rating" && currentMovies !== undefined && renderRatingState()}
      {status === "completed" && renderCompletedState()}
    </SafeIOSContainer>
  );
}

function Results({ navigation }: any) {
  const { sessionResults, currentUserId } = useMovieVoter();
  const t = useTranslation();

  if (!sessionResults) {
    return (
      <SafeIOSContainer>
        <View style={styles.center}>
          <Text>Loading results...</Text>
        </View>
      </SafeIOSContainer>
    );
  }

  if (!sessionResults.topPicks.length) {
    return (
      <SafeIOSContainer>
        <View style={styles.center}>
          <Text>No movies matched your preferences</Text>
          <Button mode="contained" onPress={() => navigation.replace("Home")} style={styles.button}>
            {t("voter.home.quit")}
          </Button>
        </View>
      </SafeIOSContainer>
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
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} size={35} />
        <Text style={{ fontSize: 40, fontFamily: "Bebas", width: "70%" }}>{t("voter.overview.title")} 🎬</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 15, paddingBottom: 15 }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", gap: 15 }}>
            <Image
              source={{ uri: "https://image.tmdb.org/t/p/w500" + card?.poster_path }}
              style={{
                width: (Dimensions.get("window").width - 30) / 2 - 60,
                height: 215,
                borderRadius: 10,
              }}
            />
            <View style={{ flex: 1, gap: 10, justifyContent: "flex-end" }}>
              <Text
                style={{
                  fontSize: 35,
                  fontFamily: "Bebas",
                }}
              >
                {card?.title || card?.name}
              </Text>
              <Text style={{ width: "100%" }}>★{card?.vote_average.toFixed(2)}/10 </Text>

              <Text style={{ width: "100%" }}>
                {card?.release_date} | {card?.original_language}
              </Text>

              {card && <CustomFavourite movie={card} />}
            </View>
          </View>
          <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "500" }}>{card?.overview}</Text>

          <View style={{ marginTop: 30 }}>
            <Text style={{ fontSize: 30, fontFamily: "Bebas", marginBottom: 15 }}>{t("voter.overview.h2")}</Text>
            {sessionResults?.topPicks?.slice(1).map((item) => (
              <TouchableRipple
                disabled={!item.movie.id}
                key={item.movie.id}
                style={{ marginBottom: 15, width: Dimensions.get("screen").width - 30, overflow: "hidden" }}
                onPress={() => {
                  navigation.navigate("MovieDetails", {
                    id: item.movie.id,
                    type: item?.movie?.title ? "movie" : "tv",
                    img: item.movie.poster_path,
                  });
                }}
              >
                <View style={{ flexDirection: "row", gap: 15 }}>
                  <Image
                    source={{ uri: "https://image.tmdb.org/t/p/w500" + item.movie.poster_path }}
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
                      <CustomFavourite movie={item.movie} />
                    </View>
                    <View>
                      <Text>★ {item.movie.vote_average.toFixed(2)}/10 </Text>

                      <Text numberOfLines={3} textBreakStrategy="simple">
                        {item.movie.release_date} | {item.movie.original_language} | {item?.movie?.overview}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableRipple>
            ))}
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.navigate("Landing")}
          style={[styles.button, { marginBottom: 15 }]}
          contentStyle={{ padding: 7.5 }}
        >
          {t("voter.home.quit")}
        </Button>
      </ScrollView>
    </ImageBackground>
  );
}

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
