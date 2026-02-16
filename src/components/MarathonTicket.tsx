import { forwardRef, memo, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { Image } from "expo-image";
import QRCode from "react-native-qrcode-svg";
import RatingIcons from "./RatingIcons";
import useTranslation from "../service/useTranslation";

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
  <View style={[styles.notch, side === "left" ? styles.notchLeft : styles.notchRight, { backgroundColor: "#000" }]}>
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

const getGenreName = (genre: string | Genre): string => {
  return typeof genre === "string" ? genre : genre.name;
};

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
          <Text style={{ fontStyle: "italic", fontSize: 11, color: "#888" }} numberOfLines={2}>
            "{movie.tagline}"
          </Text>
        ) : null}
        {/* Meta row: runtime + genres */}
        <View style={styles.metaRow}>
          {runtime ? <Text style={styles.runtimeText}>{runtime}</Text> : null}
          {runtime && genres.length > 0 ? <View style={styles.metaDot} /> : null}
          {genres.map((genre, index) => (
            <View key={index} style={styles.genrePill}>
              <Text style={styles.genreText}>{getGenreName(genre)}</Text>
            </View>
          ))}
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

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      {/* Main Ticket Body */}
      <View style={[styles.ticketBody, { backgroundColor: ticketColor }]}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerLabel}>{t("ticket.flickmate-presents")}</Text>
          <Text style={styles.headerText}>{displayHeader.toUpperCase()}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {movieCount} {t("ticket.films")}
            </Text>
            {totalRuntime ? (
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
          <TicketNotch side="left" color={"#000"} />
          <DashedLine color="#1a1a1a" />
          <TicketNotch side="right" color={"#000"} />
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
            <QRCode value={APP_URL} size={70} backgroundColor={ticketColor} color="#1a1a1a" />
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
    padding: 16,
    backgroundColor: "#000",
  },
  ticketBody: {
    width: TICKET_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  holesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    width: TICKET_WIDTH,
    marginTop: -5,
    zIndex: 10,
  },
  hole: {
    width: 16,
    height: 16,
    borderRadius: 100,
    backgroundColor: "#000",
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerLabel: {
    fontFamily: "Bebas",
    fontSize: 10,
    letterSpacing: 3,
    color: "#999",
    marginBottom: 4,
  },
  headerText: {
    fontFamily: "Bebas",
    fontSize: 32,
    letterSpacing: 3,
    color: "#1a1a1a",
    textAlign: "center",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  countText: {
    fontFamily: "Bebas",
    fontSize: 12,
    letterSpacing: 2,
    color: "#666",
  },
  countDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#999",
  },
  moviesSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  movieRow: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 12,
  },
  movieRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 4,
  },
  movieInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  movieTitle: {
    fontFamily: "Bebas",
    fontSize: 18,
    letterSpacing: 1,
    color: "#1a1a1a",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#999",
  },
  runtimeText: {
    fontFamily: "Bebas",
    fontSize: 12,
    letterSpacing: 1,
    color: "#666",
  },
  genrePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: "#d0d0d0",
  },
  genreText: {
    fontFamily: "Bebas",
    fontSize: 10,
    letterSpacing: 0.5,
    color: "#444",
  },
  ratingRow: {
    marginTop: 2,
    flexDirection: "row",
  },
  bonusSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    paddingTop: 12,
  },
  bonusHeading: {
    fontFamily: "Bebas",
    fontSize: 14,
    letterSpacing: 2,
    color: "#888",
    textAlign: "center",
    marginBottom: 12,
  },
  bonusRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  bonusItem: {
    alignItems: "center",
    flex: 1,
    maxWidth: 70,
  },
  bonusPoster: {
    width: 55,
    height: 82,
    borderRadius: 4,
  },
  bonusTitle: {
    fontFamily: "Bebas",
    fontSize: 10,
    letterSpacing: 0.5,
    color: "#666",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 12,
  },
  inviteSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  inviteBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d8d4d0",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  inviteEmoji: {
    fontSize: 18,
  },
  inviteText: {
    fontFamily: "Bebas",
    fontSize: 14,
    letterSpacing: 1,
    color: "#444",
    textAlign: "center",
  },
  tearLineSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
    position: "relative",
  },
  notch: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    borderRadius: 12,
  },
  dashedLineContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 3,
  },
  dash: {
    width: 8,
    height: 3,
    borderRadius: 1,
  },
  stubSection: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  stubLeft: {
    flex: 1,
    marginRight: 16,
  },
  stubLabel: {
    fontFamily: "Bebas",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 8,
    color: "#999",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  appLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  logoTextContainer: {
    justifyContent: "flex-end",
  },
  stubTitle: {
    fontFamily: "Bebas",
    fontSize: 22,
    letterSpacing: 2,
    lineHeight: 22,
    color: "#1a1a1a",
  },
  stubSubtitle: {
    fontFamily: "Bebas",
    fontSize: 12,
    letterSpacing: 0.5,
    color: "#666",
  },
  qrContainer: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
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
    color: "#000",
  },
});

export default memo(MarathonTicket);
