import { forwardRef, memo, useMemo } from "react";
import Text from "./Text";
import { useTheme } from "../hooks/useTheme";
import { View, StyleSheet, Dimensions } from "react-native";

import { Image } from "expo-image";
import QRCode from "./QRCode";
import GenresView from "./GenresView";
import RatingIcons from "./RatingIcons";
import useTranslation from "../service/useTranslation";
import { colors, fontSize, radius, spacing} from "../constants/design";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TICKET_WIDTH = SCREEN_WIDTH - 48;
const BACKDROP_HEIGHT = 200;

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const APP_URL = "https://flickmate.app/share";

interface Genre {
  id: number;
  name: string;
}

interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface WatchProviders {
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
  free?: Provider[];
  ads?: Provider[];
}

interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  name?: string;
  type?: "movie" | "tv";
  mapped_genres?: string[];
  genres?: Genre[];
  tagline?: string;
}

interface CinemaTicketProps {
  movie: Movie;
  providers?: WatchProviders;
  headerText?: string;
  pickupLine?: string;
  ticketColor?: string;
  accentColor?: string;
}

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

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

const getUniqueProviders = (providers?: WatchProviders): Provider[] => {
  if (!providers) return [];
  const seen = new Set<number>();
  const result: Provider[] = [];

  const allProviders = [
    ...(providers.flatrate || []),
    ...(providers.free || []),
    ...(providers.ads || []),
    ...(providers.rent || []),
    ...(providers.buy || []),
  ];

  for (const provider of allProviders) {
    if (!seen.has(provider.provider_id) && provider.logo_path) {
      seen.add(provider.provider_id);
      result.push(provider);
    }
    if (result.length >= 4) break;
  }

  if (Array.isArray(result)) return [...result].sort((a, b) => a.display_priority - b.display_priority);

  return result;
};

const CinemaTicket = forwardRef<View, CinemaTicketProps>(
  ({ movie, providers, headerText, pickupLine, ticketColor = "#F5F0E1", accentColor }, ref) => {
    const t = useTranslation();

    const headerTexts = useMemo(() => t("ticket.cinema.headers") as unknown as string[], [t]);
    const pickupLines = useMemo(() => t("ticket.cinema.pickups") as unknown as string[], [t]);

    const displayHeader = headerText || getRandomItem(headerTexts);
    const displayPickup = pickupLine || getRandomItem(pickupLines);
    const movieTitle = movie.title || movie.name || t("ticket.unknown-movie");
    const releaseYear = (movie?.release_date || movie?.first_air_date)?.split("-")[0] || "";

    const genreNames = movie.genres ? movie.genres.slice(0, 3).map((g) => g.name) : movie.mapped_genres?.slice(0, 3) || [];

    const uniqueProviders = getUniqueProviders(providers);

    return (
      <View ref={ref} style={styles.container} collapsable={false}>
        {/* Main Ticket Body */}
        <View style={[styles.ticketBody, { backgroundColor: ticketColor }]}>
          {/* Movie Backdrop */}
          <View style={styles.backdropContainer}>
            <Image source={{ uri: TMDB_IMAGE_BASE + movie.backdrop_path }} style={styles.backdrop} contentFit="cover" blurRadius={2} />
            <View style={styles.posterContainer}>
              <Image source={{ uri: TMDB_IMAGE_BASE + movie.poster_path }} style={styles.poster} contentFit="cover" />
            </View>
            <View style={styles.backdropOverlay} />
          </View>

          {/* Movie Info Section */}
          <View style={styles.infoSection}>
            {/* Playful Header Text */}
            <Text style={styles.headerText}>{displayHeader}</Text>

            <Text style={styles.movieTitle} numberOfLines={2}>
              {(movieTitle as string).toUpperCase()}
            </Text>

            {/* Tagline */}
            {movie.tagline ? (
              <Text style={styles.tagline} numberOfLines={2}>
                "{movie.tagline}"
              </Text>
            ) : null}

            {/* Year + Genres Row */}
            <View style={styles.metaRow}>
              <Text style={styles.yearText}>{releaseYear}</Text>
              {genreNames.length > 0 && (
                <>
                  <View style={styles.metaDot} />
                  <View style={styles.genresContainer}>
                    <GenresView genres={genreNames} light />
                  </View>
                </>
              )}
            </View>

            {movie?.overview ? (
              <Text style={{ color: "#888", marginBottom: spacing.lg }} numberOfLines={4}>
                {movie.overview}
              </Text>
            ) : null}

            {/* Star Rating */}
            <View style={[styles.ratingRow]}>
              <View style={[styles.ratingRowInner, { backgroundColor: ticketColor }]}>
                <RatingIcons vote={movie.vote_average || 0} size={18} activeColor="#FFB800" inactiveColor="#ccc" />
              </View>
            </View>

            {/* Watch Providers */}
            {uniqueProviders.length > 0 && (
              <View style={styles.providersSection}>
                <Text style={styles.providersTitle}>{t("ticket.watch-it-on")}</Text>

                <View style={styles.providersRow}>
                  {uniqueProviders.map((provider) => (
                    <View key={provider.provider_id} style={styles.providerLogoWrapper}>
                      <Image source={{ uri: TMDB_IMAGE_BASE + provider.logo_path }} style={styles.providerLogo} contentFit="cover" />
                      <View style={[styles.providerOverlay, { backgroundColor: ticketColor }]} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Invite Text */}
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

          {/* Watermark */}
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>FLICKMATE</Text>
          </View>
        </View>

        {/* Decorative holes at bottom - outside overflow:hidden */}
        <TicketHoles />
      </View>
    );
  },
);

CinemaTicket.displayName = "CinemaTicket";

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
  backdropContainer: {
    width: "100%",
    height: BACKDROP_HEIGHT,
    position: "relative",
    backgroundColor: "#333",
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  posterContainer: { position: "absolute", top: 0, left: 0, right: 0, justifyContent: "center", alignItems: "center", paddingTop: spacing.xs + 3.5 },
  poster: {
    width: 120,
    height: 175,
    borderRadius: radius.xs + 1,
  },

  backdropOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  infoSection: {
    padding: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerText: {
    fontFamily: "Bebas",
    fontSize: fontSize.md,
    letterSpacing: 3,
    color: "#888",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  movieTitle: {
    fontFamily: "Bebas",
    fontSize: 30,
    letterSpacing: 2,
    lineHeight: 34,
    color: colors.input,
  },
  tagline: {
    fontStyle: "italic",
    fontSize: fontSize.md - 1,
    color: "#888",
    marginBottom: spacing.md + 2,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: spacing.md,
    gap: spacing.sm - 2,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: radius.xs - 2,
    backgroundColor: "#999",
    marginHorizontal: spacing.xs,
  },
  yearText: {
    fontFamily: "Bebas",
    fontSize: fontSize.lg,
    letterSpacing: 2,
    color: "#666",
  },
  genresContainer: {
    flexDirection: "row",
    overflow: "hidden",
    gap: spacing.sm - 2,
  },
  ratingRow: {
    alignItems: "center",
    marginBottom: spacing.lg,
    position: "absolute",
    top: -12.5,
    left: 0,
    right: 0,
    justifyContent: "center",
  },
  ratingRowInner: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs, borderRadius: radius.modal, flexDirection: "row" },
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
  providersSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  providersRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  providerLogoWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radius.xs + 2,
  },
  providerLogo: {
    width: 32,
    height: 32,
  },
  providerOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  providersTitle: {
    fontFamily: "Bebas",
    fontSize: fontSize.sm - 1,
    letterSpacing: 1,
    color: "#888",
    textTransform: "uppercase",
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

export default memo(CinemaTicket);
