import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import IconButton from "../../components/IconButton";
import Text from "../../components/Text";
import { colors, common, fontWeight, fontSize, radius, spacing, typography, withAlpha } from "../../constants/design";
import PrimaryButton from "../../components/PrimaryButton";
import Touch from "../../components/Touch";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import MovieRow from "../../components/MovieRow";
import QuickActions from "../../components/QuickActions";
import AnimatedBgClassic from "../../components/GameSummary/AnimatedBgClassic";
import { useMovieVoter } from "../../service/useVoter";
import { usePartyGameFlow } from "../../hooks/usePartyGameFlow";
import ReviewManager from "../../utils/rate";
import useTranslation from "../../service/useTranslation";
import GameRatingPill from "../../components/GameRatingPill";
import { posthog } from "../../constants/posthog";
import { Movie } from "../../../types";

const VOTER_AMBER = "#E5A830";

const scaleTitle = (title: string, size = 42) => {
  if (title.length > 30) return size * 0.7;
  if (title.length > 20) return size * 0.85;
  return size;
};

const yearOf = (movie: Partial<Movie>) =>
  (movie.release_date || movie.first_air_date || "").slice(0, 4);

export default function Results() {
  const { sessionResults, sessionId, isHost, actions } = useMovieVoter();
  const insets = useSafeAreaInsets();
  const t = useTranslation();

  const configuring = usePartyGameFlow(isHost, (mode) => {
    if (mode === "voter") {
      ReviewManager.onGameComplete(true);
      actions.resetSession();
    } else if (mode === "either-or") {
      router.navigate("/either-or/setup" as any);
    }
  });

  const openMovie = (movie: Partial<Movie>) => {
    router.push({
      pathname: "/movie/type/[type]/[id]",
      params: {
        id: movie.id as unknown as string,
        type: movie.title ? "movie" : "tv",
        img: movie.poster_path,
      },
    });
  };

  const onQuit = () => {
    ReviewManager.onGameComplete(true);
    router.dismissAll();
  };

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
        <PrimaryButton onPress={onQuit} style={styles.emptyBtn}>
          {t("voter.home.quit")}
        </PrimaryButton>
      </View>
    );
  }

  const card = sessionResults.selectedMovie;
  const allPosters = sessionResults.topPicks.map((p) => p.movie);
  const year = card ? yearOf(card) : "";
  const language = card?.original_language ?? "";
  const winnerTitle = card?.title || card?.name || "";
  const footerPad = Platform.OS === "android" ? spacing.screen : spacing.sm;

  return (
    <View style={styles.fill}>
      <AnimatedBgClassic matchedMovies={allPosters} />
      <View style={styles.overlay} />

      <GameRatingPill sessionId={sessionId ?? undefined} shouldShow={!!sessionResults.topPicks.length} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.sm, paddingBottom: (isHost ? 80 : 72) + footerPad },
        ]}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.pageHeader}>
          <Touch scaleTo={0.9} onPress={onQuit} style={styles.headerBtn}>
            <MaterialCommunityIcons name="chevron-left" size={26} color={colors.text} />
          </Touch>
          <Text style={styles.pageTitle}>{t("voter.overview.title")} 🎬</Text>
          <View style={styles.headerBtn} />
        </Animated.View>

        {/* Winner hero */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.hero}>
          <Text style={styles.eyebrow}>🏆 Winner</Text>
          <Text style={[styles.winnerTitle, { fontSize: scaleTitle(winnerTitle) }]}>
            {winnerTitle}
          </Text>

          <Touch scaleTo={0.97} onPress={() => card && openMovie(card)} disabled={!card?.id} style={styles.posterWrap}>
            <Thumbnail
              path={card?.poster_path ?? ""}
              size={ThumbnailSizes.poster.large}
              style={styles.winnerPoster}
            />
          </Touch>

          <View style={styles.metaRow}>
            {card?.vote_average != null && (
              <>
                <MaterialCommunityIcons name="star" size={13} color={VOTER_AMBER} />
                <Text style={styles.metaText}>{card.vote_average.toFixed(1)}</Text>
              </>
            )}
            {!!year && <Text style={styles.metaDot}>·</Text>}
            {!!year && <Text style={styles.metaText}>{year}</Text>}
            {!!language && <Text style={styles.metaDot}>·</Text>}
            {!!language && <Text style={styles.metaText}>{language.toUpperCase()}</Text>}
          </View>

          {card && (
            <View style={styles.quickActionsWrap}>
              <QuickActions movie={card as Movie} />
            </View>
          )}

          {!!card?.overview && (
            <Text style={styles.overview} numberOfLines={4}>
              {card.overview}
            </Text>
          )}
        </Animated.View>

        {/* Top picks */}
        {sessionResults.topPicks.length > 1 && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.picksSection}>
            <Text style={styles.sectionTitle}>{t("voter.overview.h2")}</Text>
            <View style={styles.picksList}>
              {sessionResults.topPicks.slice(1).map((item, i) => (
                <View key={item.movie.id} style={styles.pickRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{i + 2}</Text>
                  </View>
                  <View style={styles.movieRowWrap}>
                    <MovieRow
                      id={item.movie.id ?? 0}
                      title={item.movie.title || item.movie.name || ""}
                      posterPath={item.movie.poster_path ?? ""}
                      type={item.movie.title ? "movie" : "tv"}
                      year={yearOf(item.movie)}
                      score={item.movie.vote_average}
                      onPress={() => openMovie(item.movie)}
                      trailing={
                        <View style={styles.agreementChip}>
                          <Text style={styles.agreementText}>
                            {Math.round(item.agreement * 100)}%
                          </Text>
                        </View>
                      }
                    />
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer */}
      {isHost ? (
        <View style={[styles.footer, { paddingBottom: footerPad }]}>
          <IconButton
            icon="logout"
            size={24}
            onPress={onQuit}
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
      ) : (
        <View
          pointerEvents={configuring ? "none" : "auto"}
          style={[styles.footer, { paddingBottom: footerPad, opacity: configuring ? 0.4 : 1 }]}
        >
          <PrimaryButton onPress={onQuit} style={styles.playAgainBtn}>
            {t("voter.home.quit")}
          </PrimaryButton>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,8,15,0.78)",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.appBackground,
  },
  emptyBtn: {
    marginTop: spacing.screen,
    borderRadius: radius.pill,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Bebas",
    fontSize: 28,
    color: colors.text,
    letterSpacing: 1,
  },
  hero: {
    alignItems: "center",
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
    marginBottom: spacing.lg,
  },
  posterWrap: {
    borderRadius: radius.lg + 2,
    borderWidth: 2,
    borderColor: VOTER_AMBER,
    shadowColor: VOTER_AMBER,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  winnerPoster: {
    width: 160,
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 1,
    marginTop: spacing.lg,
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
  quickActionsWrap: {
    width: "100%",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  overview: {
    fontSize: fontSize.md,
    lineHeight: 21,
    color: withAlpha(colors.text, 0.65),
    textAlign: "center",
    maxWidth: 320,
    marginTop: spacing.md,
  },
  picksSection: {
    marginTop: spacing.xxl + spacing.sm,
  },
  sectionTitle: {
    fontFamily: "Bebas",
    fontSize: typography.bebasSize.section,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  picksList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  pickRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: withAlpha(colors.surfaceElevated, 0.9),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rankText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.placeholder,
  },
  movieRowWrap: {
    flex: 1,
  },
  agreementChip: {
    backgroundColor: withAlpha(VOTER_AMBER, 0.15),
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderWidth: 1,
    borderColor: withAlpha(VOTER_AMBER, 0.35),
  },
  agreementText: {
    fontSize: fontSize.sm,
    color: VOTER_AMBER,
    fontWeight: fontWeight.bold,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    backgroundColor: withAlpha(colors.appBackground, 0.95),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
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
