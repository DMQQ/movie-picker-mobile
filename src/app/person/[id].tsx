import { Link, router, useLocalSearchParams } from "expo-router";
import { Dimensions, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useGetPersonScreenQuery } from "../../redux/person/personApi";
import Thumbnail, { ThumbnailSizes } from "../../components/Thumbnail";
import Text from "../../components/Text";
import IconButton from "../../components/IconButton";
import PlatformBlurView from "../../components/PlatformBlurView";
import { SectionListItem, SECTION_ITEM_HEIGHT, SECTION_ITEM_WIDTH } from "../../components/SectionItem";
import { colors, common, fontSize, fontWeight, radius, spacing, typography } from "../../constants/design";

const { width, height } = Dimensions.get("screen");
const IMG_HEIGHT = height * 0.58;

function formatBirthday(birthday: string): string {
  return new Date(birthday).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getAge(birthday: string): number {
  const today = new Date();
  const born = new Date(birthday);
  const age = today.getFullYear() - born.getFullYear();
  return today < new Date(today.getFullYear(), born.getMonth(), born.getDate())
    ? age - 1
    : age;
}

export default function PersonScreen() {
  const { id, img } = useLocalSearchParams<{ id: string; img?: string }>();
  const insets = useSafeAreaInsets();
  const [bioExpanded, setBioExpanded] = useState(false);

  const { data, isLoading } = useGetPersonScreenQuery(
    { id: Number(id) },
    { skip: !id || isNaN(Number(id)) },
  );

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const profilePath = img || data?.profile_path || "";
  const castCredits = (data?.credits?.cast ?? []).filter((c) => c.poster_path).slice(0, 20);
  const photos = (data?.images?.profiles ?? []).slice(1, 13);
  const longBio = (data?.biography?.length ?? 0) > 250;

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground, width, height }}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: "center", paddingTop: IMG_HEIGHT, width }}
        overScrollMode="never"
        bounces={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        stickyHeaderIndices={[0]}
      >
        {/* Index 0 — sticky so the hero stays fixed while content scrolls over it */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            width,
            height: IMG_HEIGHT,
          }}
        >
          <Link.AppleZoomTarget>
            <Thumbnail
              size={ThumbnailSizes.poster.xxlarge}
              path={profilePath}
              container={{ width, height: IMG_HEIGHT }}
              priority="high"
            />
          </Link.AppleZoomTarget>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.45)", colors.appBackground]}
            style={StyleSheet.absoluteFill}
            locations={[0.45, 0.78, 1]}
          />
        </Animated.View>

        {/* Index 1 — scrollable content */}
        <View style={{ zIndex: 10, position: "relative", width, backgroundColor: colors.appBackground }}>
          {/* Drag handle */}
          <View style={styles.dragHandleRow}>
            <View style={styles.dragHandle} />
          </View>

          {/* Name + department */}
          <View style={styles.section}>
            <Text style={styles.name}>{data?.name ?? " "}</Text>
            {!!data?.known_for_department && (
              <View style={styles.departmentBadge}>
                <Text style={styles.departmentText}>{data.known_for_department}</Text>
              </View>
            )}
          </View>

          {/* Birthday + place of birth */}
          {(!!data?.birthday || !!data?.place_of_birth) && (
            <View style={[styles.section, styles.metaRow]}>
              {!!data?.birthday && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="cake-variant-outline" size={13} color={colors.placeholder} />
                  <Text style={styles.metaText}>
                    {formatBirthday(data.birthday)} · age {getAge(data.birthday)}
                  </Text>
                </View>
              )}
              {!!data?.place_of_birth && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="map-marker-outline" size={13} color={colors.placeholder} />
                  <Text style={styles.metaText} numberOfLines={1}>{data.place_of_birth}</Text>
                </View>
              )}
            </View>
          )}

          {/* External links */}
          {(!!data?.external_ids?.imdb_id || !!data?.external_ids?.instagram_id) && (
            <View style={[styles.section, styles.linksRow]}>
              {!!data.external_ids.imdb_id && (
                <Pressable
                  onPress={() => Linking.openURL(`https://www.imdb.com/name/${data.external_ids.imdb_id}`)}
                  style={styles.linkChip}
                >
                  <Text style={styles.linkText}>IMDb</Text>
                </Pressable>
              )}
              {!!data.external_ids.instagram_id && (
                <Pressable
                  onPress={() => Linking.openURL(`https://instagram.com/${data.external_ids.instagram_id}`)}
                  style={styles.linkChip}
                >
                  <MaterialCommunityIcons name="instagram" size={13} color={colors.text} />
                  <Text style={styles.linkText}>@{data.external_ids.instagram_id}</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Biography */}
          {!!data?.biography && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Biography</Text>
              <Text style={styles.biography} numberOfLines={bioExpanded ? undefined : 4}>
                {data.biography}
              </Text>
              {longBio && (
                <Pressable onPress={() => setBioExpanded((v) => !v)} style={{ marginTop: spacing.sm }}>
                  <Text style={styles.readMore}>{bioExpanded ? "Show less" : "Read more"}</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Known For */}
          {castCredits.length > 0 && (
            <View style={{ marginBottom: spacing.xxl, height: SECTION_ITEM_HEIGHT + spacing.xl + spacing.md }}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.screen }]}>Known For</Text>
              <FlashList
                data={castCredits}
                keyExtractor={(c) => `${c.id}-${c.character ?? "crew"}`}
                renderItem={({ item: credit }) => (
                  <SectionListItem
                    id={credit.id}
                    type={credit.media_type === "tv" ? "tv" : "movie"}
                    poster_path={credit.poster_path!}
                    vote_average={credit.vote_average ?? 0}
                    title={credit.title}
                    name={credit.name}
                    genres={credit.genres}
                  />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={SECTION_ITEM_WIDTH + spacing.screen}
                contentContainerStyle={{ paddingLeft: spacing.screen }}
              />
            </View>
          )}

          {/* Photo gallery */}
          {photos.length > 0 && (
            <View style={{ marginBottom: spacing.xxl }}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.screen }]}>Photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.screen, gap: spacing.sm, paddingTop: spacing.sm }}
                overScrollMode="never"
              >
                {photos.map((photo, i) => (
                  <Thumbnail
                    key={i}
                    size={ThumbnailSizes.profile.medium}
                    path={photo.file_path}
                    container={styles.photoThumb}
                    priority="low"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: insets.bottom + spacing.xxl }} />
        </View>
      </Animated.ScrollView>

      {/* Floating back button */}
      <View style={[styles.backButton, { top: insets.top + spacing.sm }]}>
        <PlatformBlurView interactive style={{ borderRadius: radius.pill, overflow: "hidden" }}>
          <IconButton
            icon="chevron-left"
            size={28}
            iconColor={colors.text}
            onPress={() => router.back()}
            style={common.iconButton}
          />
        </PlatformBlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dragHandleRow: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  section: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.xl,
  },
  name: {
    fontFamily: typography.bebas,
    fontSize: typography.bebasSize.auth,
    color: colors.text,
    letterSpacing: typography.bebasLetterSpacing,
    marginBottom: spacing.sm,
  },
  departmentBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.input,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  departmentText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    fontWeight: fontWeight.medium,
  },
  metaRow: {
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 1,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
    flex: 1,
  },
  linksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  linkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.input,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  sectionTitle: {
    fontFamily: typography.bebas,
    fontSize: typography.bebasSize.section,
    color: colors.text,
    letterSpacing: typography.bebasLetterSpacing,
    marginBottom: spacing.md,
  },
  biography: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
  },
  readMore: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  photoThumb: {
    width: 90,
    height: 120,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  backButton: {
    position: "absolute",
    left: spacing.screen,
    zIndex: 100,
  },
});
