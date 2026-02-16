import { forwardRef, memo, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import QRCode from "react-native-qrcode-svg";
import RatingIcons from "./RatingIcons";
import useTranslation from "../service/useTranslation";

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

    const headerTexts = useMemo(() => t("ticket.cinema.headers") as string[], [t]);
    const pickupLines = useMemo(() => t("ticket.cinema.pickups") as string[], [t]);

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
                    {genreNames.map((genre, index) => (
                      <View key={index} style={styles.genrePill}>
                        <Text style={styles.genrePillText}>{genre}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>

            {movie?.overview ? (
              <Text style={{ color: "#888", marginBottom: 16 }} numberOfLines={4}>
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
  backdropContainer: {
    width: "100%",
    height: BACKDROP_HEIGHT,
    position: "relative",
  },
  backdrop: {
    width: "100%",
    height: "100%",
  },
  posterContainer: { position: "absolute", top: 0, left: 0, right: 0, justifyContent: "center", alignItems: "center", paddingTop: 7.5 },
  poster: {
    width: 120,
    height: 175,
    borderRadius: 5,
  },

  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  infoSection: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerText: {
    fontFamily: "Bebas",
    fontSize: 14,
    letterSpacing: 3,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  movieTitle: {
    fontFamily: "Bebas",
    fontSize: 30,
    letterSpacing: 2,
    lineHeight: 34,
    color: "#1a1a1a",
  },
  tagline: {
    fontStyle: "italic",
    fontSize: 13,
    color: "#888",
    marginBottom: 14,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 6,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#999",
    marginHorizontal: 4,
  },
  yearText: {
    fontFamily: "Bebas",
    fontSize: 16,
    letterSpacing: 2,
    color: "#666",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  genrePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: "#d0d0d0",
  },
  genrePillText: {
    fontFamily: "Bebas",
    fontSize: 11,
    letterSpacing: 1,
    color: "#444",
  },
  ratingRow: {
    alignItems: "center",
    marginBottom: 16,
    position: "absolute",
    top: -12.5,
    left: 0,
    right: 0,
    justifyContent: "center",
  },
  ratingRowInner: { paddingHorizontal: 4, paddingVertical: 4, borderRadius: 20, flexDirection: "row" },
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
  providersSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  providersRow: {
    flexDirection: "row",
    gap: 8,
  },
  providerLogoWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 6,
  },
  providerLogo: {
    width: 32,
    height: 32,
  },
  providerOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  providersTitle: {
    fontFamily: "Bebas",
    fontSize: 11,
    letterSpacing: 1,
    color: "#888",
    textTransform: "uppercase",
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

export default memo(CinemaTicket);
