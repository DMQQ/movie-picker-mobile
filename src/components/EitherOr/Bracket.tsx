import { Fragment, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../Text";
import Thumbnail from "../Thumbnail";
import useTranslation from "../../service/useTranslation";
import { colors, fontSize, fontWeight, radius, spacing, withAlpha } from "../../constants/design";
import type { Movie } from "../../../types";
import type { CurrentMatch, MatchResultEntry } from "../../redux/eitherOr/eitherOrSlice";

interface Sizing {
  CARD_W: number;
  ROW_H: number;
  SLOT_H: number;
  CONNECTOR_W: number;
  THUMB_W: number;
  THUMB_H: number;
  ICON: number;
  LABEL_H: number;
  FONT: number;
  ACCENT: number;
}

const BASE_SIZING: Sizing = {
  CARD_W: 140,
  ROW_H: 96,
  SLOT_H: 44,
  CONNECTOR_W: 24,
  THUMB_W: 28,
  THUMB_H: 42,
  ICON: 13,
  LABEL_H: 28,
  FONT: 11,
  ACCENT: 3,
};

export function computeBracketFitScale(bracketSize: number, roundsShown: number, availableWidth: number, availableHeight: number, startRound = 1) {
  const effectiveBracketSize = bracketSize / Math.pow(2, startRound - 1);
  const matchesInFirstRound = effectiveBracketSize / 2;
  const neededHeight = matchesInFirstRound * BASE_SIZING.ROW_H + BASE_SIZING.LABEL_H;
  const neededWidth = roundsShown * BASE_SIZING.CARD_W + Math.max(roundsShown - 1, 0) * BASE_SIZING.CONNECTOR_W;
  const scale = Math.min(availableHeight / neededHeight, availableWidth / neededWidth);
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.min(Math.max(scale, 0.35), 1.75);
}

function scaleSizing(scale: number): Sizing {
  return {
    CARD_W: BASE_SIZING.CARD_W * scale,
    ROW_H: BASE_SIZING.ROW_H * scale,
    SLOT_H: BASE_SIZING.SLOT_H * scale,
    CONNECTOR_W: BASE_SIZING.CONNECTOR_W * scale,
    THUMB_W: BASE_SIZING.THUMB_W * scale,
    THUMB_H: BASE_SIZING.THUMB_H * scale,
    ICON: BASE_SIZING.ICON * scale,
    LABEL_H: BASE_SIZING.LABEL_H * scale,
    FONT: BASE_SIZING.FONT * scale,
    ACCENT: BASE_SIZING.ACCENT,
  };
}

function getRoundLabel(t: (key: string, args?: Record<string, number | string | boolean>) => string, roundNumber: number, totalRounds: number) {
  const roundsFromEnd = totalRounds - roundNumber;
  if (roundsFromEnd === 0) return t("eitherOr.bracket.final");
  if (roundsFromEnd === 1) return t("eitherOr.bracket.semifinal");
  if (roundsFromEnd === 2) return t("eitherOr.bracket.quarterfinal");
  return t("eitherOr.bracket.round", { round: roundNumber });
}

interface Props {
  bracketSize: number;
  matchResults: MatchResultEntry[];
  currentMatch: CurrentMatch | null;
  champion: Movie | null;
  maxRound?: number;
  startRound?: number;
  scale?: number;
}

export default function Bracket({ bracketSize, matchResults, currentMatch, champion, maxRound, startRound = 1, scale = 1 }: Props) {
  const t = useTranslation();
  const sz = useMemo(() => scaleSizing(scale), [scale]);
  const CARD_H = sz.SLOT_H * 2 + 1;
  const totalRounds = Math.log2(bracketSize);
  const effectiveBracketSize = bracketSize / Math.pow(2, startRound - 1);
  const effectiveFirstRoundCount = effectiveBracketSize / 2;
  const effectiveTotalRounds = Math.log2(effectiveBracketSize);
  const roundsToShow = Math.min((maxRound ?? totalRounds) - startRound + 1, effectiveTotalRounds);

  const centers = useMemo(() => {
    let prev = Array.from({ length: effectiveFirstRoundCount }, (_, i) => i * sz.ROW_H + sz.ROW_H / 2);
    const all: number[][] = [prev];
    for (let r = 2; r <= effectiveTotalRounds; r++) {
      const next: number[] = [];
      for (let i = 0; i < prev.length / 2; i++) {
        next.push((prev[2 * i] + prev[2 * i + 1]) / 2);
      }
      all.push(next);
      prev = next;
    }
    return all;
  }, [effectiveBracketSize, effectiveFirstRoundCount, effectiveTotalRounds, sz.ROW_H]);

  const containerHeight = effectiveFirstRoundCount * sz.ROW_H;
  const championCenter = centers[effectiveTotalRounds - 1]?.[0] ?? 0;
  const showChampion = (maxRound ?? totalRounds) >= totalRounds && roundsToShow === effectiveTotalRounds;
  const visibleCenters = centers.slice(0, Math.max(roundsToShow, 0));

  const findResult = (roundNumber: number, matchIndex: number) =>
    matchResults.find((m) => m.roundNumber === roundNumber && m.matchIndex === matchIndex) ?? null;

  const totalHeight = containerHeight + sz.LABEL_H;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ height: totalHeight, width: "100%", flexGrow: 0 }}
      contentContainerStyle={[styles.scroll, { flexGrow: 1, justifyContent: "center" }]}
    >
      <View style={{ height: totalHeight, flexDirection: "row", alignItems: "flex-start" }}>
        {visibleCenters.map((roundCenters, rIdx) => {
          const roundNumber = startRound + rIdx;
          return (
            <Fragment key={roundNumber}>
              <View style={{ width: sz.CARD_W }}>
                <View style={[styles.roundLabelWrap, { height: sz.LABEL_H }]}>
                  <Text style={[styles.roundLabel, { fontSize: Math.max(sz.FONT - 0.5, 7) }]} numberOfLines={1}>
                    {getRoundLabel(t, roundNumber, totalRounds)}
                  </Text>
                </View>
                <View style={{ height: containerHeight }}>
                  {roundCenters.map((cy, i) => {
                    const result = findResult(roundNumber, i);
                    const isLive = !result && currentMatch?.roundNumber === roundNumber && currentMatch?.matchIndex === i;
                    return (
                      <MatchNode
                        key={i}
                        top={cy - CARD_H / 2}
                        sz={sz}
                        cardH={CARD_H}
                        slots={
                          result
                            ? [
                                { movie: result.winner, won: true },
                                { movie: result.loser, won: false },
                              ]
                            : isLive
                              ? [
                                  { movie: currentMatch!.champion, won: null },
                                  { movie: currentMatch!.challenger, won: null },
                                ]
                              : [null, null]
                        }
                        live={isLive}
                      />
                    );
                  })}
                </View>
              </View>

              {rIdx < roundsToShow - 1 && (
                <View style={{ marginTop: sz.LABEL_H }}>
                  <Connectors
                    childCenters={visibleCenters[rIdx]}
                    parentCenters={visibleCenters[rIdx + 1]}
                    height={containerHeight}
                    connectorW={sz.CONNECTOR_W}
                  />
                </View>
              )}

              {rIdx === roundsToShow - 1 && showChampion && (
                <>
                  <View style={{ marginTop: sz.LABEL_H }}>
                    <FinalConnector center={championCenter} height={containerHeight} connectorW={sz.CONNECTOR_W} />
                  </View>
                  <View style={{ width: sz.CARD_W }}>
                    <View style={[styles.roundLabelWrap, { height: sz.LABEL_H }]}>
                      <Text style={[styles.roundLabel, { fontSize: Math.max(sz.FONT - 0.5, 7) }]} numberOfLines={1}>
                        {t("eitherOr.bracket.champion")}
                      </Text>
                    </View>
                    <View style={{ height: containerHeight }}>
                      <ChampionNode
                        top={championCenter - CARD_H / 2}
                        movie={champion}
                        label={t("eitherOr.bracket.champion")}
                        sz={sz}
                        cardH={CARD_H}
                      />
                    </View>
                  </View>
                </>
              )}
            </Fragment>
          );
        })}
      </View>
    </ScrollView>
  );
}

interface Slot {
  movie: Movie;
  won: boolean | null;
}

function MatchNode({
  top,
  slots,
  live,
  sz,
  cardH,
}: {
  top: number;
  slots: [Slot | null, Slot | null];
  live: boolean;
  sz: Sizing;
  cardH: number;
}) {
  return (
    <View style={[styles.node, { top, height: cardH, width: sz.CARD_W }, live && styles.nodeLive]}>
      <MatchSlot slot={slots[0]} sz={sz} />
      <View style={styles.nodeDivider} />
      <MatchSlot slot={slots[1]} sz={sz} />
    </View>
  );
}

function MatchSlot({ slot, sz }: { slot: Slot | null; sz: Sizing }) {
  const t = useTranslation();

  if (!slot) {
    return (
      <View style={[styles.slot, styles.slotEmpty, { height: sz.SLOT_H }]}>
        <Text style={[styles.tbdText, { fontSize: sz.FONT }]}>{t("eitherOr.bracket.tbd")}</Text>
      </View>
    );
  }

  const title = slot.movie.title || slot.movie.name;
  const lost = slot.won === false;
  const won = slot.won === true;

  return (
    <View style={[styles.slot, { height: sz.SLOT_H }, won && styles.slotWon, lost && styles.slotLost]}>
      {won && <View style={[styles.winnerAccent, { width: sz.ACCENT }]} />}
      <Thumbnail
        path={slot.movie.poster_path}
        size={92}
        container={{ width: sz.THUMB_W, height: sz.THUMB_H, borderRadius: 2, flexShrink: 0 }}
        style={{ width: sz.THUMB_W, height: sz.THUMB_H, borderRadius: 2 }}
      />
      <Text numberOfLines={2} style={[styles.slotText, { fontSize: sz.FONT, lineHeight: sz.FONT * 1.25 }, won && styles.slotTextWon, lost && styles.slotTextLost]}>
        {title}
      </Text>
      {won && <MaterialCommunityIcons name="trophy" size={sz.ICON} color="#FFD166" style={styles.trophyIcon} />}
    </View>
  );
}

function ChampionNode({ top, movie, label, sz, cardH }: { top: number; movie: Movie | null; label: string; sz: Sizing; cardH: number }) {
  return (
    <View style={[styles.championNode, { top, width: sz.CARD_W, height: cardH }]}>
      {movie ? (
        <>
          <View style={styles.championGlow}>
            <Thumbnail
              path={movie.poster_path}
              size={185}
              container={{ width: sz.THUMB_W * 2.2, height: sz.THUMB_H * 2.2, borderRadius: radius.xs, borderWidth: 2, borderColor: "#FFD166" }}
              style={{ width: sz.THUMB_W * 2.2, height: sz.THUMB_H * 2.2, borderRadius: radius.xs }}
            />
          </View>
          <MaterialCommunityIcons name="trophy" size={sz.ICON + 4} color="#FFD166" />
          <Text numberOfLines={2} style={[styles.championText, { fontSize: sz.FONT }]}>
            {movie.title || movie.name}
          </Text>
        </>
      ) : (
        <Text style={[styles.tbdText, { fontSize: sz.FONT }]}>{label}</Text>
      )}
    </View>
  );
}

function Connectors({
  childCenters,
  parentCenters,
  height,
  connectorW,
}: {
  childCenters: number[];
  parentCenters: number[];
  height: number;
  connectorW: number;
}) {
  return (
    <View style={{ width: connectorW, height }}>
      {parentCenters.map((py, i) => {
        const c1 = childCenters[2 * i];
        const c2 = childCenters[2 * i + 1];
        const top = Math.min(c1, c2);
        const lineHeight = Math.max(c1, c2) - Math.min(c1, c2);
        return (
          <Fragment key={i}>
            <View style={[styles.hLine, { left: 0, top: c1, width: connectorW / 2 }]} />
            <View style={[styles.hLine, { left: 0, top: c2, width: connectorW / 2 }]} />
            <View style={[styles.vLine, { left: connectorW / 2, top, height: lineHeight }]} />
            <View style={[styles.hLine, { left: connectorW / 2, top: py, width: connectorW / 2 }]} />
          </Fragment>
        );
      })}
    </View>
  );
}

function FinalConnector({ center, height, connectorW }: { center: number; height: number; connectorW: number }) {
  return (
    <View style={{ width: connectorW, height }}>
      <View style={[styles.hLine, { left: 0, top: center, width: connectorW }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  roundLabelWrap: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  roundLabel: {
    fontFamily: "Bebas",
    color: colors.placeholder,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  node: {
    position: "absolute",
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeLive: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 6,
  },
  nodeDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  slot: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  slotEmpty: {
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  slotWon: {
    backgroundColor: withAlpha("#FFD166", 0.08),
  },
  slotLost: {
    opacity: 0.38,
  },
  winnerAccent: {
    alignSelf: "stretch",
    backgroundColor: "#FFD166",
    flexShrink: 0,
  },
  slotText: {
    flex: 1,
    color: colors.text,
    zIndex: 10,
  },
  slotTextWon: {
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  slotTextLost: {
    color: colors.placeholder,
  },
  trophyIcon: {
    marginRight: spacing.xs,
    flexShrink: 0,
  },
  tbdText: {
    color: withAlpha(colors.text, 0.3),
    fontWeight: fontWeight.medium,
  },
  championNode: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs - 1,
  },
  championGlow: {
    shadowColor: "#FFD166",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  championText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing.xs,
  },
  hLine: {
    position: "absolute",
    height: 1,
    backgroundColor: withAlpha(colors.text, 0.18),
  },
  vLine: {
    position: "absolute",
    width: 1,
    backgroundColor: withAlpha(colors.text, 0.18),
  },
});
