import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../constants/design";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addToGroup, removeFromGroup } from "../redux/favourites/favourites";
import { useAppDispatch, useAppSelector } from "../redux/store";
import useTranslation from "../service/useTranslation";

export default function FavouriteGroupsScreen() {
  const dispatch = useAppDispatch<any>();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const { movieId, movieTitle, movieName, moviePosterPath, movieType } =
    useLocalSearchParams<{
      movieId: string;
      movieTitle?: string;
      movieName?: string;
      moviePosterPath?: string;
      movieType?: string;
    }>();

  const groups = useAppSelector((state) => state.favourite.groups);

  const filtered = query
    ? groups.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
    : groups;

  const onPress = (group: (typeof groups)[number]) => {
    const inGroup = group.movies.some(
      (m) => +m.id === +movieId && m.type === movieType,
    );

    if (inGroup) {
      dispatch(removeFromGroup({ groupId: group.id, movieId: +movieId }));
    } else {
      dispatch(
        addToGroup({
          item: {
            id: movieId,
            imageUrl: moviePosterPath ?? "",
            type:
              (movieType as any) ?? (movieTitle !== undefined ? "movie" : "tv"),
          },
          groupId: group.id,
        }),
      );
    }

    if (Platform.OS === "ios")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {Platform.OS === "android" && <View style={styles.grabber} />}
      <Text style={styles.title}>
        {t("quick-actions.modal")}{" "}
        <Text style={styles.movieTitle}>{movieTitle || movieName}</Text>
      </Text>

      <View style={styles.searchRow}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.placeholder}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lists…"
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={colors.placeholder}
            />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: group }) => {
          const inGroup = group.movies.some((m) => m.id === movieId);
          return (
            <Pressable
              style={[
                styles.item,
                inGroup && { backgroundColor: colors.primary },
              ]}
              onPress={() => onPress(group)}
              android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            >
              <MaterialCommunityIcons
                name={inGroup ? "bookmark-check" : "bookmark-outline"}
                size={22}
                color={inGroup ? "#fff" : colors.placeholder}
                style={styles.itemIcon}
              />
              <Text style={styles.itemText}>{group.name}</Text>
              {inGroup && (
                <MaterialCommunityIcons name="check" size={18} color="#fff" />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 15,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontFamily: "Bebas",
    marginBottom: 18,
  },
  movieTitle: {
    color: colors.primary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 46,
    borderWidth: 1,
    borderColor: colors.disabled,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  clearBtn: {
    padding: 4,
  },
  list: {
    gap: spacing.sm + 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.text,
  },
});
