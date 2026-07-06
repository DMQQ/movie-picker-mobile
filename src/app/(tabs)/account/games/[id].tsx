import { Link, router, useLocalSearchParams } from "expo-router";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PageHeading from "../../../../components/PageHeading";
import { SectionListItem } from "../../../../components/SectionItem";
import Thumbnail, { ThumbnailSizes } from "../../../../components/Thumbnail";
import { useGetGameQuery } from "../../../../redux/lists/listsApi";
import type { GameMember, ListItem } from "../../../../redux/lists/listsApi";

const { width: SW } = Dimensions.get("window");
const COLUMNS = 3;
const H_PAD = 12;
const GAP = 6;
const TILE_SIZE = Math.floor((SW - H_PAD * 2 - GAP * (COLUMNS - 1)) / COLUMNS);

function formatGameType(raw: string | null) {
  if (!raw) return "Swipe Game";
  if (raw.includes("/tv")) return "TV Shows";
  if (raw.includes("/movie")) return "Movies";
  return "Swipe Game";
}

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
      <View style={styles.memberAvatar}>
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
      <Icon source={icon} size={12} color="#BB86FC" />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useGetGameQuery(id);
  const insets = useSafeAreaInsets();

  const session = data?.session ?? null;
  const items = data?.items ?? [];
  const members = data?.members ?? [];
  const bannerHeight = insets.top + 280;
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
                {data?.list.posterPath ? (
                  <Thumbnail
                    path={data.list.posterPath}
                    size={ThumbnailSizes.poster.large}
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
                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.55)", "#000"]}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFill}
              />

              <View
                style={[styles.bannerContent, { paddingTop: insets.top + 52 }]}
              >
                <Text style={styles.bannerDate}>
                  {data ? formatDate(data.list.createdAt) : ""}
                </Text>
                <Text style={styles.bannerTitle}>
                  {data?.list.sessionId ?? " "}
                </Text>
                <Text style={styles.bannerType}>
                  {formatGameType(session?.gameType ?? null)}
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
                  color="rgba(255,255,255,0.08)"
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
  container: { flex: 1, backgroundColor: "#000" },

  bannerWrap: {
    overflow: "hidden",
    marginHorizontal: -H_PAD,
  },
  bannerPlaceholder: { backgroundColor: "#111" },
  bannerContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: H_PAD,
    paddingBottom: 20,
    gap: 4,
  },
  bannerDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontFamily: "Bebas",
    fontSize: 38,
    color: "#fff",
    letterSpacing: 1,
    lineHeight: 40,
  },
  bannerType: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { fontSize: 11, color: "rgba(255,255,255,0.75)" },

  list: { paddingHorizontal: H_PAD, paddingBottom: 40 },
  row: { gap: GAP },

  listHeader: { marginBottom: 20 },

  membersSection: { marginTop: 20, gap: 10 },
  membersSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  membersList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  memberChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 24,
    paddingRight: 12,
    paddingLeft: 4,
    paddingVertical: 4,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  memberAvatarImg: { width: 28, height: 28 },
  memberAvatarLetter: { fontSize: 12, fontWeight: "700", color: "#fff" },
  memberName: { fontSize: 13, color: "rgba(255,255,255,0.8)", maxWidth: 100 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 2,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Bebas",
    color: "#fff",
    letterSpacing: 0.5,
  },
  sectionBadge: {
    backgroundColor: "rgba(187,134,252,0.2)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: { fontSize: 12, color: "#BB86FC", fontWeight: "600" },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
    gap: 12,
  },
  emptyText: { fontSize: 14, color: "rgba(255,255,255,0.3)" },
});
