import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import IconButton from "../../components/IconButton";
import Text from "../../components/Text";
import { colors, common, fontWeight, fontSize, radius, spacing, typography, withAlpha } from "../../constants/design";
import PlatformBlurView from "../../components/PlatformBlurView";
import PrimaryButton from "../../components/PrimaryButton";
import Touch from "../../components/Touch";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import QuickActions from "../../components/QuickActions";
import { useMovieVoter } from "../../service/useVoter";
import { usePartyGameFlow } from "../../hooks/usePartyGameFlow";
import PartyWaitingOverlay from "../../components/PartyWaitingOverlay";
import ReviewManager from "../../utils/rate";
import useTranslation from "../../service/useTranslation";
import GameRatingPill from "../../components/GameRatingPill";
import { posthog } from "../../constants/posthog";

const VOTER_AMBER = "#E5A830";

interface PickMovie {
  id?: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  original_language?: string;
}

const scaleTitle = (title: string, size = 32) => {
  if (title.length > 30) return size * 0.75;
  if (title.length > 20) return size * 0.85;
  return size;
};

export default function Results() {
  const { sessionResults, sessionId, isHost, actions } = useMovieVoter();
  const t = useTranslation();

  const configuring = usePartyGameFlow(isHost, (mode) => {
    if (mode === "voter") {
      ReviewManager.onGameComplete(true);
      actions.resetSession();
    } else if (mode === "either-or") {
      router.navigate("/either-or/setup" as any);
    }
  });

  if (!sessionResults) {
    return (
      <View style={styles.center}>
        <Text>{t("voter.overview.loading")}</Text>
      </View>
    );
  }

  if (!sessionResults.topPicks.length) {
    return (
      <View style={styles.center}>
        <Text>{t("voter.overview.no-matches")}</Text>
        <PrimaryButton onPress={() => router.dismissAll()} style={styles.button}>
          {t("voter.home.quit")}
        </PrimaryButton>
      </View>
    );
  }

  const card = sessionResults.selectedMovie;

  const openMovie = (movie: PickMovie) => {
    router.push({
      pathname: "/movie/type/[type]/[id]",
      params: {
        id: movie.id as unknown as string,
        type: movie.title ? "movie" : "tv",
        img: movie.poster_path,
      },
    });
  };

  const yearOf = (movie: PickMovie) =>
    (movie.release_date || movie.first_air_date || "").slice(0, 4);

  const year = card ? yearOf(card) : "";
  const language = card?.original_language ?? "";

  return (
    <ImageBackground
      blurRadius={5}
      source={{ uri: "https://image.tmdb.org/t/p/w500" + card?.backdrop_path }}
      style={styles.fill}
    >
      <View style={styles.header}>
        <PlatformBlurView
          interactive
          style={styles.backWrap}
        >
          <IconButton
            icon="chevron-left"
            onPress={() => router.dismissAll()}
            size={28}
            style={common.iconButton}
          />
        </PlatformBlurView>
        <Text style={styles.headerTitle}>{t("voter.overview.title")} 🎬</Text>
      </View>

      <GameRatingPill sessionId={sessionId ?? undefined} shouldShow={!!sessionResults?.topPicks.length} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isHost ? 78 : spacing.lg }]}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Winner</Text>
          <Text
            style={[styles.winnerTitle, { fontSize: scaleTitle((card?.title || card?.name) as string) }]}
          >
            {card?.title || card?.name}
          </Text>

          <Touch scaleTo={0.97} onPress={() => card && openMovie(card)} disabled={!card?.id}>
            <Thumbnail
              path={card?.poster_path ?? ""}
              size={ThumbnailSizes.poster.large}
              style={styles.winnerPoster}
            />
          </Touch>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="star" size={14} color={VOTER_AMBER} />
            <Text style={styles.metaText}>{card?.vote_average.toFixed(1)}</Text>
            {!!year && <Text style={styles.metaDot}>·</Text>}
            {!!year && <Text style={styles.metaText}>{year}</Text>}
            {!!language && <Text style={styles.metaDot}>·</Text>}
            {!!language && <Text style={styles.metaText}>{language.toUpperCase()}</Text>}
          </View>

          {card && <QuickActions movie={card} />}

          {!!card?.overview && (
            <Text style={styles.overview} numberOfLines={5}>
              {card?.overview}
            </Text>
          )}
        </View>

        <View style={styles.picksSection}>
          <Text style={styles.sectionTitle}>{t("voter.overview.h2")}</Text>
          <View style={styles.picksList}>
            {sessionResults.topPicks.slice(1).map((item) => (
              <Touch
                key={item.movie.id}
                scaleTo={0.97}
                disabled={!item.movie.id}
                onPress={() => openMovie(item.movie)}
                style={styles.pickRow}
              >
                <Thumbnail
                  path={item.movie.poster_path ?? ""}
                  size={ThumbnailSizes.poster.small}
                  style={styles.pickPoster}
                />
                <View style={styles.pickInfo}>
                  <Text numberOfLines={1} style={styles.pickTitle}>
                    {item.movie.title || item.movie.name}
                  </Text>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="star" size={12} color={VOTER_AMBER} />
                    <Text style={styles.metaText}>{item.movie.vote_average.toFixed(1)}</Text>
                    {!!yearOf(item.movie) && <Text style={styles.metaDot}>·</Text>}
                    {!!yearOf(item.movie) && <Text style={styles.metaText}>{yearOf(item.movie)}</Text>}
                  </View>
                </View>
                <Text style={styles.agreementText}>
                  {Math.round(item.agreement * 100)}%
                </Text>
              </Touch>
            ))}
          </View>
        </View>
      </ScrollView>

      {isHost && (
        <View style={styles.footerBar}>
          <IconButton
            icon="logout"
            size={24}
            onPress={() => {
              ReviewManager.onGameComplete(true);
              router.dismissAll();
            }}
            style={[common.iconButton, styles.quitIcon]}
          />
          <PrimaryButton
            icon={({ color }) => (
              <MaterialCommunityIcons name="refresh" size={18} color={color} />
            )}
            onPress={() => {
              posthog?.capture("play_again_tapped", { game: "voter" });
              router.push({ pathname: "/play-again", params: { from: "voter" } } as any);
            }}
            style={styles.playAgainBtn}
          >
            {t("game-summary.play-again")}
          </PrimaryButton>
        </View>
      )}

      <PartyWaitingOverlay visible={configuring} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  button: {
    marginTop: spacing.screen,
    borderRadius: radius.pill,
  },
  header: {
    height: 64,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backWrap: {
    position: "absolute",
    left: spacing.sm + 2,
    top: spacing.sm + 2,
    zIndex: 100,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: "Bebas",
    width: "100%",
    textAlign: "center",
  },
  scroll: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
  },
  hero: {
    alignItems: "center",
    paddingTop: spacing.md,
  },
  eyebrow: {
    fontSize: fontSize.sm,
    color: VOTER_AMBER,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: fontWeight.semibold,
  },
  winnerTitle: {
    fontFamily: "Bebas",
    color: colors.text,
    textAlign: "center",
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  winnerPoster: {
    width: 170,
    height: 255,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    marginVertical: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs - 2,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  metaDot: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    opacity: 0.5,
  },
  overview: {
    fontSize: fontSize.md,
    lineHeight: 21,
    color: withAlpha(colors.text, 0.8),
    textAlign: "center",
    maxWidth: 320,
    marginTop: spacing.lg,
  },
  picksSection: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.section,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  picksList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickPoster: {
    width: 38,
    height: 54,
    borderRadius: radius.xs + 1,
    backgroundColor: colors.surfaceElevated,
  },
  pickInfo: {
    flex: 1,
  },
  pickTitle: {
    fontFamily: "Bebas",
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: 0.5,
  },
  agreementText: {
    fontSize: fontSize.lg,
    color: VOTER_AMBER,
    fontWeight: fontWeight.bold,
  },
  footerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.appBackground,
  },
  playAgainBtn: {
    flex: 1,
    borderRadius: radius.pill,
  },
  quitIcon: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
