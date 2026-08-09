import { forwardRef, memo, useMemo } from "react";
import Text from "./Text";
import { View, StyleSheet, Dimensions } from "react-native";

import { Image } from "expo-image";
import QRCode from "react-native-qrcode-svg";
import GenresView from "./GenresView";
import RatingIcons from "./RatingIcons";
import useTranslation from "../service/useTranslation";
import { colors, fontSize, radius, spacing} from "../constants/design";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TICKET_WIDTH = SCREEN_WIDTH - 48;
const MAIN_MOVIES = 3;
const MAX_BONUS_MOVIES = 4;

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const APP_URL = "https://flickmate.app/share";

interface Genre {
  id: number;
  name: string;
}

interface MarathonMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  type?: "movie" | "tv";
  vote_average?: number;
  runtime?: number;
  genres?: (string | Genre)[];

  tagline?: string;
}

interface MarathonTicketProps {
  movies: MarathonMovie[];
  headerText?: string;
  pickupLine?: string;
  ticketColor?: string;
}

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const formatRuntime = (minutes?: number): string => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const formatTotalRuntime = (movies: MarathonMovie[]): string => {
  const totalMinutes = movies.reduce((acc, movie) => acc + (movie.runtime || 0), 0);
  if (totalMinutes === 0) return "";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const TicketNotch = memo(({ side, color }: { side: "left" | "right"; color: string }) => (
  <View style={[styles.notch, side === "left" ? styles.notchLeft : styles.notchRight, { backgroundColor: colors.appBackground }]}>
    <View style={[styles.notchInner, { backgroundColor: color }]} />
  </View>
));

const DashedLine = memo(({ color }: { color: string }) => (
  <View style={styles.dashedLineContainer}>
    {Array.from({ length: 25 }).map((_, i) => (
      <View key={i} style={[styles.dash, { backgroundColor: color }]} />
    ))}
  </View>
));

const TicketHoles = memo(() => (
  <View style={styles.holesRow}>
    {Array.from({ length: 10 }).map((_, i) => (
      <View key={i} style={styles.hole} />
    ))}
  </View>
));

const MovieRow = memo(({ movie, isLast, unknownText }: { movie: MarathonMovie; isLast: boolean; unknownText: string }) => {
  const title = movie.title || movie.name || unknownText;
  const runtime = formatRuntime(movie.runtime);
  const genres = movie.genres?.slice(0, 3) || [];

  return (
    <View style={[styles.movieRow, !isLast && styles.movieRowBorder]}>
      <Image source={{ uri: TMDB_IMAGE_BASE + movie.poster_path }} style={styles.poster} contentFit="cover" />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {title}
        </Text>

        {movie?.tagline ? (
          <Text style={{ fontStyle: "italic", fontSize: fontSize.sm - 1, color: "#888" }} numberOfLines={2}>
            "{movie.tagline}"
          </Text>
        ) : null}
        {/* Meta row: runtime + genres */}
        <View style={styles.metaRow}>
          {runtime ? <Text style={styles.runtimeText}>{runtime}</Text> : null}
          {runtime && genres.length > 0 ? <View style={styles.metaDot} /> : null}
          <GenresView genres={genres} light />
        </View>

        {/* Rating */}
        {movie.vote_average ? (
          <View style={styles.ratingRow}>
            <RatingIcons vote={movie.vote_average} size={12} activeColor="#FFB800" inactiveColor="#ccc" />
          </View>
        ) : null}
      </View>
    </View>
  );
});

const BonusPoster = memo(({ movie, unknownText }: { movie: MarathonMovie; unknownText: string }) => {
  const title = movie.title || movie.name || unknownText;

  return (
    <View style={styles.bonusItem}>
      <Image source={{ uri: TMDB_IMAGE_BASE + movie.poster_path }} style={styles.bonusPoster} contentFit="cover" />
      <Text style={styles.bonusTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
});

const MarathonTicket = forwardRef<View, MarathonTicketProps>(({ movies, headerText, pickupLine, ticketColor = "#F5F0E1" }, ref) => {
  const t = useTranslation();

  const headerTexts = useMemo(() => t("ticket.marathon.headers") as string[], [t]);
  const pickupLines = useMemo(() => t("ticket.marathon.pickups") as string[], [t]);
  const bonusHeadings = useMemo(() => t("ticket.marathon.bonus-headings") as string[], [t]);

  const displayHeader = headerText || getRandomItem(headerTexts);
  const displayPickup = pickupLine || getRandomItem(pickupLines);
  const bonusHeading = getRandomItem(bonusHeadings);
  const unknownText = t("ticket.unknown") as string;

  const mainMovies = movies.slice(0, MAIN_MOVIES);
  const bonusMovies = movies.slice(MAIN_MOVIES, MAIN_MOVIES + MAX_BONUS_MOVIES);
  const allDisplayedMovies = [...mainMovies, ...bonusMovies];
  const movieCount = allDisplayedMovies.length;
  const totalRuntime = formatTotalRuntime(allDisplayedMovies);

  const runtimesAvailable = mainMovies.every((movie) => movie.runtime);

  const countLabel = useMemo(() => {
    const count = allDisplayedMovies.reduce(
      (acc, curr) => {
        if (curr.type === "movie")
          return {
            ...acc,
            movies: acc.movies + 1,
          };
        if (curr.type === "tv")
          return {
            ...acc,
            series: acc.series + 1,
          };
        return acc;
      },
      {
        series: 0,
        movies: 0,
      },
    );

    if (count.movies > 0 && count.series === 0) return `${count.movies} ${t("ticket.films")}`;
    if (count.series > 0 && count.movies === 0) return `${count.series} ${t("ticket.series")}`;
    if (count.movies > 0 && count.series > 0)
      return `${count.movies + count.series} ${t("ticket.films")} ${t("ticket.and")}  ${t("ticket.series")}`;
    return "";
  }, [allDisplayedMovies]);

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      {/* Main Ticket Body */}
      <View style={[styles.ticketBody, { backgroundColor: ticketColor }]}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerLabel}>{t("ticket.flickmate-presents")}</Text>
          <Text style={styles.headerText}>{displayHeader.toUpperCase()}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{countLabel}</Text>
            {totalRuntime && runtimesAvailable ? (
              <>
                <View style={styles.countDot} />
                <Text style={styles.countText}>{totalRuntime}</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Main Movies List (vertical) */}
        <View style={styles.moviesSection}>
          {mainMovies.map((movie, index) => (
            <MovieRow key={movie.id} movie={movie} isLast={index === mainMovies.length - 1} unknownText={unknownText} />
          ))}
        </View>

        {/* Bonus Movies (horizontal) */}
        {bonusMovies.length > 0 ? (
          <View style={styles.bonusSection}>
            <Text style={styles.bonusHeading}>{bonusHeading}</Text>
            <View style={styles.bonusRow}>
              {bonusMovies.map((movie) => (
                <BonusPoster key={movie.id} movie={movie} unknownText={unknownText} />
              ))}
            </View>
          </View>
        ) : null}

        {/* Invite Box */}
        <View style={styles.inviteSection}>
          <View style={styles.inviteBox}>
            <Text style={styles.inviteEmoji}>🎬</Text>
            <Text style={styles.inviteText}>{displayPickup}</Text>
            <Text style={styles.inviteEmoji}>🍿</Text>
          </View>
        </View>

        {/* Tear Line with Notches */}
        <View style={styles.tearLineSection}>
          <TicketNotch side="left" color={colors.appBackground} />
          <DashedLine color={colors.input} />
          <TicketNotch side="right" color={colors.appBackground} />
        </View>

        {/* Stub Section */}
        <View style={styles.stubSection}>
          <View style={styles.stubLeft}>
            <Text style={styles.stubLabel}>{t("ticket.scan-to-get-app")}</Text>
            <View style={styles.logoRow}>
              <Image source={require("../../assets/images/icon-dark.png")} style={styles.appLogo} contentFit="contain" />
              <View style={styles.logoTextContainer}>
                <Text style={styles.stubTitle}>FLICKMATE</Text>
                <Text style={styles.stubSubtitle}>{t("ticket.app-tagline")}</Text>
              </View>
            </View>
          </View>

          <View style={styles.qrContainer}>
            <QRCode value={APP_URL} size={70} backgroundColor={ticketColor} color={colors.input} />
          </View>
        </View>

        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>FLICKMATE</Text>
        </View>
      </View>

      <TicketHoles />
    </View>
  );
});

MarathonTicket.displayName = "MarathonTicket";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.appBackground,
  },
  ticketBody: {
    width: TICKET_WIDTH,
    borderRadius: radius.card,
    overflow: "hidden",
    position: "relative",
  },
  holesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    width: TICKET_WIDTH,
    marginTop: -5,
    zIndex: 10,
  },
  hole: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.appBackground,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  headerLabel: {
    fontFamily: "Bebas",
    fontSize: fontSize.xs,
    letterSpacing: 3,
    color: "#999",
    marginBottom: spacing.xs,
  },
  headerText: {
    fontFamily: "Bebas",
    fontSize: 32,
    letterSpacing: 3,
    color: colors.input,
    textAlign: "center",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  countText: {
    fontFamily: "Bebas",
    fontSize: fontSize.sm,
    letterSpacing: 2,
    color: "#666",
  },
  countDot: {
    width: 4,
    height: 4,
    borderRadius: radius.xs - 2,
    backgroundColor: "#999",
  },
  moviesSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  movieRow: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  movieRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: radius.xs,
  },
  movieInfo: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },
  movieTitle: {
    fontFamily: "Bebas",
    fontSize: fontSize.xl,
    letterSpacing: 1,
    color: colors.input,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm - 2,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: radius.xs - 3.5,
    backgroundColor: "#999",
  },
  runtimeText: {
    fontFamily: "Bebas",
    fontSize: fontSize.sm,
    letterSpacing: 1,
    color: "#666",
  },
  ratingRow: {
    marginTop: spacing.xs - 2,
    flexDirection: "row",
  },
  bonusSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    paddingTop: spacing.md,
  },
  bonusHeading: {
    fontFamily: "Bebas",
    fontSize: fontSize.md,
    letterSpacing: 2,
    color: "#888",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  bonusRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
  },
  bonusItem: {
    alignItems: "center",
    flex: 1,
    maxWidth: 70,
  },
  bonusPoster: {
    width: 55,
    height: 82,
    borderRadius: radius.xs,
  },
  bonusTitle: {
    fontFamily: "Bebas",
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    color: "#666",
    textAlign: "center",
    marginTop: spacing.xs + 2,
    lineHeight: 12,
  },
  inviteSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  inviteBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d8d4d0",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm + 2,
  },
  inviteEmoji: {
    fontSize: fontSize.xl,
  },
  inviteText: {
    fontFamily: "Bebas",
    fontSize: fontSize.md,
    letterSpacing: 1,
    color: "#444",
    textAlign: "center",
  },
  tearLineSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    position: "relative",
  },
  notch: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    position: "absolute",
    zIndex: 5,
  },
  notchLeft: {
    left: -12,
  },
  notchRight: {
    right: -12,
  },
  notchInner: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
  },
  dashedLineContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    height: 3,
  },
  dash: {
    width: 8,
    height: 3,
    borderRadius: radius.xs - 3,
  },
  stubSection: {
    flexDirection: "row",
    padding: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: "center",
    justifyContent: "space-between",
  },
  stubLeft: {
    flex: 1,
    marginRight: spacing.lg,
  },
  stubLabel: {
    fontFamily: "Bebas",
    fontSize: fontSize.xs,
    letterSpacing: 2,
    marginBottom: spacing.sm,
    color: "#999",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm + 2,
  },
  appLogo: {
    width: 40,
    height: 40,
    borderRadius: radius.sm + 2,
  },
  logoTextContainer: {
    justifyContent: "flex-end",
  },
  stubTitle: {
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 2,
    lineHeight: 22,
    color: colors.input,
  },
  stubSubtitle: {
    fontFamily: "Bebas",
    fontSize: fontSize.sm,
    letterSpacing: 0.5,
    color: "#666",
  },
  qrContainer: {
    padding: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: radius.sm,
  },
  watermark: {
    position: "absolute",
    bottom: 30,
    left: 20,
    opacity: 0.03,
  },
  watermarkText: {
    fontFamily: "Bebas",
    fontSize: 65,
    letterSpacing: 8,
    color: colors.appBackground,
  },
});

export default memo(MarathonTicket);
