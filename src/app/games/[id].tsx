import { Link, router, useLocalSearchParams } from "expo-router";
import Icon from "../../components/Icon";
import Text from "../../components/Text";
import {
  colors,
  fontWeight,
  fontSize,
  radius,
  spacing,
  withAlpha,
} from "../../constants/design";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import PageHeading from "../../components/PageHeading";
import { SectionListItem } from "../../components/SectionItem";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import { useAppSelector } from "../../redux/store";
import { useGetGameQuery } from "../../redux/lists/listsApi";
import type { GameMember, ListItem } from "../../redux/lists/listsApi";
import { formatGameType } from "../../utils/formatGameType";
import { getUserAvatarColor } from "../../utils/avatar";

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
      <View style={[styles.memberAvatar, { backgroundColor: getUserAvatarColor(member.name) }]}>
        {member.avatarUrl ? (
          <Image
            style={styles.memberAvatarImg}
            source={{ uri: member.avatarUrl }}
            cachePolicy="memory-disk"
          />
        ) : (
          <Text style={styles.memberAvatarLetter}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
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

export default function GameDetailScreen() {
  const { id, poster: posterParam } = useLocalSearchParams<{ id: string; poster?: string }>();
  const user = useAppSelector((s) => s.auth.user);
  const isFullAccount = !!user && user.provider !== "anonymous";
  const { data, isLoading, isError } = useGetGameQuery(id, { skip: !isFullAccount });
  const session = data?.session ?? null;
  const items = data?.items ?? [];
  const posterPath = data?.list.posterPath ?? posterParam ?? null;
  const members = data?.members ?? [];
  const bannerHeight = Dimensions.get("window").height / 2;
  const duration = session
    ? formatDuration(session.startTime, session.endTime)
    : null;

  return (
    <View style={styles.container}>
      <PageHeading
        title=""
        showGradientBackground={false}
        onPress={() => router.back()}
      />

      <FlatList
        data={items}
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
                  <View
                    style={[StyleSheet.absoluteFill, styles.bannerPlaceholder]}
                  />
                )}
              </Link.AppleZoomTarget>

              <LinearGradient
                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.55)", colors.appBackground]}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFill}
              />

              <View style={[styles.bannerContent, { paddingTop: spacing.xxl * 2 + 4 }]}>
                <Text style={styles.bannerTitle}>
                  {formatGameType(session?.gameType ?? null)}
                </Text>
                <Text style={styles.bannerDate}>
                  {data ? formatDate(data.list.createdAt) : ""}
                </Text>
                {session && (
                  <View style={styles.pills}>
                    <Pill
                      icon="gesture-swipe"
                      label={`${session.totalSwipes} swipes`}
                    />
                    <Pill
                      icon="heart"
                      label={`${session.totalMatches} matches`}
                    />
                    {duration && <Pill icon="clock-outline" label={duration} />}
                  </View>
                )}
              </View>
            </View>

            {/* Players */}
            {members.length > 0 && (
              <View style={styles.membersSection}>
                <Text style={styles.membersSectionTitle}>Players</Text>
                <View style={styles.membersList}>
                  {members.map((m) => (
                    <MemberChip key={m.id} member={m} />
                  ))}
                </View>
              </View>
            )}

            {/* Section heading */}
            {items.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Matched Movies</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{items.length}</Text>
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
              <Text style={styles.emptyText}>Game not found</Text>
            ) : (
              <>
                <Icon
                  source="movie-open-outline"
                  size={44}
                  color={colors.overlay}
                />
                <Text style={styles.emptyText}>No matches recorded</Text>
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
  bannerPlaceholder: { backgroundColor: "#111" },
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
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: radius.md + 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  memberAvatarImg: { width: 28, height: 28 },
  memberAvatarLetter: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.text },
  memberName: { fontSize: fontSize.md - 1, color: "rgba(255,255,255,0.8)", maxWidth: 100 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs - 2,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontFamily: "Bebas",
    color: colors.text,
    letterSpacing: 0.5,
  },
  sectionBadge: {
    backgroundColor: withAlpha(colors.primary, 0.2),
    borderRadius: radius.modal,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
  },
  sectionBadgeText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: { fontSize: fontSize.md, color: "rgba(255,255,255,0.3)" },
});
