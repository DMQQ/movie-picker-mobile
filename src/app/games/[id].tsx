import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Icon from "../../components/Icon";
import Text from "../../components/Text";
import UserAvatar from "../../components/UserAvatar";
import SegmentedControl from "../../components/SegmentedControl";
import {
  colors,
  fontWeight,
  fontSize,
  radius,
  spacing,
  withAlpha,
} from "../../constants/design";
import { Dimensions, FlatList, Pressable, StyleSheet, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import PageHeading from "../../components/PageHeading";
import { SectionListItem } from "../../components/SectionItem";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useGetGameQuery } from "../../redux/lists/listsApi";
import type { GameMember, ListItem } from "../../redux/lists/listsApi";
import { setPendingBulkMovies } from "../../redux/favourites/favourites";
import { formatGameType } from "../../utils/formatGameType";
import useTranslation from "../../service/useTranslation";

const { width: SW } = Dimensions.get("window");
const COLUMNS = 3;
const H_PAD = 12;
const GAP = 6;
const TILE_SIZE = Math.floor((SW - H_PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS);

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(start: number, end: number | null) {
  if (!end) return null;
  const secs = end - start;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function MemberChip({ member }: { member: GameMember }) {
  return (
    <View style={styles.memberChip}>
      <UserAvatar
        name={member.name}
        avatarUrl={member.avatarUrl}
        size={28}
        style={styles.memberAvatar}
      />
      <Text style={styles.memberName} numberOfLines={1}>
        {member.name}
      </Text>
    </View>
  );
}

function Pill({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.pill}>
      <Icon source={icon} size={12} color={colors.primary} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

type Tab = "matches" | "liked" | "disliked";

const TAB_OPTIONS = [
  { value: "matches", labelKey: "game-summary.tab-matches" },
  { value: "liked", labelKey: "games.tab-liked" },
  { value: "disliked", labelKey: "games.tab-disliked" },
];

export default function GameDetailScreen() {
  const t = useTranslation();
  const { id, poster: posterParam } = useLocalSearchParams<{ id: string; poster?: string }>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  const { data, isLoading, isError } = useGetGameQuery(id, { skip: !isFullAccount });
  const [tab, setTab] = useState<Tab>("matches");
  const session = data?.session ?? null;
  const items = data?.items ?? [];
  const liked = data?.liked ?? [];
  const disliked = data?.disliked ?? [];
  const posterPath = data?.list.posterPath ?? posterParam ?? null;
  const members = data?.members ?? [];
  const bannerHeight = Dimensions.get("window").height / 2;
  const duration = session
    ? formatDuration(session.startTime, session.endTime)
    : null;

  const activeItems = tab === "matches" ? items : tab === "liked" ? liked : disliked;
  const hasAnyContent = items.length > 0 || liked.length > 0 || disliked.length > 0;
  const canSave = tab !== "disliked" && activeItems.length > 0;

  const handleSaveAll = () => {
    dispatch(
      setPendingBulkMovies(
        activeItems.map((item) => ({
          id: item.contentId,
          title: item.content.title,
          poster_path: item.content.poster_path ?? undefined,
          type: item.contentType as "movie" | "tv",
        })),
      ),
    );
    router.push("/favourite-groups");
  };

  return (
    <View style={styles.container}>
      <PageHeading
        title=""
        showGradientBackground={false}
        onPress={() => router.back()}
      />

      <FlatList
        data={activeItems}
        keyExtractor={(item) => item.id}
        numColumns={COLUMNS}
        bounces={false}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Banner */}
            <View style={[styles.bannerWrap, { height: bannerHeight }]}>
              <Link.AppleZoomTarget>
                {posterPath ? (
                  <Thumbnail
                    path={posterPath}
                    size={ThumbnailSizes.poster.xlarge}
                    container={StyleSheet.absoluteFill}
                    showsPlaceholder={false}
                    priority="high"
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.bannerPlaceholder]}>
                    <Image
                      source={require("../../../assets/images/adaptive-icon.png")}
                      style={styles.bannerLogo}
                      contentFit="contain"
                    />
                  </View>
                )}
              </Link.AppleZoomTarget>

              <LinearGradient
                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.55)", colors.appBackground]}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFill}
              />

              <View style={[styles.bannerContent, { paddingTop: spacing.xxl * 2 + 4 }]}>
                <Text style={styles.bannerTitle}>
                  {t(formatGameType(session?.gameType ?? null))}
                </Text>
                <Text style={styles.bannerDate}>
                  {data ? formatDate(data.list.createdAt) : ""}
                </Text>
                {session && (
                  <View style={styles.pills}>
                    <Pill
                      icon="gesture-swipe"
                      label={t("games.swipes", { count: session.totalSwipes })}
                    />
                    <Pill
                      icon="heart"
                      label={t("games.matches", { count: session.totalMatches })}
                    />
                    {duration && <Pill icon="clock-outline" label={duration} />}
                  </View>
                )}
              </View>
            </View>

            {/* Players */}
            {members.length > 0 && (
              <View style={styles.membersSection}>
                <Text style={styles.membersSectionTitle}>{t("games.players")}</Text>
                <View style={styles.membersList}>
                  {members.map((m) => (
                    <MemberChip key={m.id} member={m} />
                  ))}
                </View>
              </View>
            )}

            {/* Section heading */}
            {hasAnyContent && (
              <View style={styles.sectionHeader}>
                <SegmentedControl
                  options={TAB_OPTIONS.map((o) => ({ ...o, label: t(o.labelKey) }))}
                  value={tab}
                  onChange={(v) => setTab(v as Tab)}
                  size="sm"
                />
                <View style={styles.sectionMeta}>
                  <Text style={styles.sectionCount}>{t("games.titles", { count: activeItems.length })}</Text>
                  {canSave && (
                    <Pressable style={styles.saveAllBtn} onPress={handleSaveAll}>
                      <Icon source="bookmark-plus-outline" size={15} color={colors.primary} />
                      <Text style={styles.saveAllText}>{t("games.save-all")}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <Icon source="loading" size={32} color="rgba(255,255,255,0.2)" />
            ) : isError ? (
              <Text style={styles.emptyText}>{t("games.not-found")}</Text>
            ) : (
              <>
                <Icon
                  source="movie-open-outline"
                  size={44}
                  color={colors.overlay}
                />
                <Text style={styles.emptyText}>{t("games.no-matches")}</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }: { item: ListItem }) => (
          <SectionListItem
            id={item.contentId}
            type={item.contentType}
            poster_path={item.content.poster_path ?? ""}
            vote_average={0}
            title={item.content.title}
            imageWidth={TILE_SIZE}
            hideTitle
            thumbnailSize={ThumbnailSizes.poster.medium}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.appBackground },

  bannerWrap: {
    overflow: "hidden",
    marginHorizontal: -H_PAD,
  },
  bannerPlaceholder: {
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerLogo: { width: 120, height: 120, opacity: 0.9 },
  bannerContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: H_PAD,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  bannerDate: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontFamily: "Bebas",
    fontSize: 42,
    color: colors.text,
    letterSpacing: 1,
    lineHeight: 44,
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm - 2 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 1,
    backgroundColor: colors.border,
    borderRadius: radius.modal,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  pillText: { fontSize: fontSize.sm - 1, color: "rgba(255,255,255,0.75)" },

  list: { paddingHorizontal: H_PAD, paddingBottom: spacing.xxl + 16 },
  row: { gap: GAP },

  listHeader: { marginBottom: spacing.xl },

  membersSection: { marginTop: spacing.xl, gap: spacing.sm + 2 },
  membersSectionTitle: {
    fontSize: fontSize.md - 1,
    fontWeight: fontWeight.semibold,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  membersList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: radius.lg,
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
    paddingVertical: spacing.xs,
  },
  memberAvatar: {},
  memberName: { fontSize: fontSize.md - 1, color: "rgba(255,255,255,0.8)", maxWidth: 100 },
  sectionHeader: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  sectionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionCount: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.35)",
  },
  saveAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 1,
    backgroundColor: withAlpha(colors.primary, 0.15),
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveAllText: {
    fontSize: fontSize.md - 1,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: { fontSize: fontSize.md, color: "rgba(255,255,255,0.3)" },
});
