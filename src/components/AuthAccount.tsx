import { useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Icon, Text, TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import Thumbnail, { ThumbnailSizes } from "./Thumbnail";
import Touch from "./Touch";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { MD2DarkTheme } from "react-native-paper";
import type { AuthUser } from "../redux/auth/authSlice";
import {
  useDeleteMeMutation,
  useUpdateMeMutation,
} from "../redux/auth/authApi";
import { authActions } from "../redux/auth/authSlice";
import { useAppDispatch } from "../redux/store";
import * as SecureStore from "expo-secure-store";
import { useGetGamesQuery, type UserGame } from "../redux/lists/listsApi";

const CARD_WIDTH = Dimensions.get("window").width - 60;
const CARD_HEIGHT = 200;

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatGameType(raw: string | null) {
  if (!raw) return "Swipe Game";
  if (raw.includes("/tv")) return "TV Shows";
  if (raw.includes("/movie")) return "Movies";
  return "Swipe Game";
}

function GameCard({ game }: { game: UserGame }) {
  return (
    <Link href={`/(tabs)/account/games/${game.id}` as any} asChild>
      <Touch style={card.wrap}>
        <View style={{ flex: 1 }}>
          <Link.AppleZoom>
            {game.posterPath ? (
              <Thumbnail
                path={game.posterPath}
                size={ThumbnailSizes.poster.large}
                container={card.image}
                showsPlaceholder={false}
                priority="normal"
              />
            ) : (
              <View style={[card.image, card.placeholder]}>
                <Icon
                  source="movie-open-outline"
                  size={40}
                  color="rgba(255,255,255,0.15)"
                />
              </View>
            )}
          </Link.AppleZoom>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.92)"]}
            style={card.gradient}
          />

          <View style={card.meta}>
            <Text style={card.sessionId} numberOfLines={1}>
              {game.sessionId}
            </Text>
            <Text style={card.sub}>
              {formatGameType(game.session?.gameType ?? null)} ·{" "}
              {formatDate(game.createdAt)}
            </Text>
            <View style={card.stats}>
              <View style={card.statBadge}>
                <Icon source="heart" size={11} color="#BB86FC" />
                <Text style={card.statText}>{game.matchCount} matches</Text>
              </View>
              {game.session && (
                <View style={card.statBadge}>
                  <Icon
                    source="gesture-swipe"
                    size={11}
                    color="rgba(255,255,255,0.5)"
                  />
                  <Text style={card.statText}>
                    {game.session.totalSwipes} swipes
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Touch>
    </Link>
  );
}

function RecentGames() {
  const { data, isLoading } = useGetGamesQuery();
  const games = data?.games ?? [];

  if (isLoading) {
    return (
      <View style={rg.placeholder}>
        <Icon source="loading" size={16} color="rgba(255,255,255,0.3)" />
        <Text style={rg.placeholderText}>Loading games…</Text>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={rg.placeholder}>
        <Icon
          source="controller-classic-outline"
          size={20}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={rg.placeholderText}>No games yet — start swiping!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + 12}
      snapToAlignment="start"
      contentContainerStyle={rg.list}
    >
      {[...games].reverse().map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
    </ScrollView>
  );
}

interface Props {
  user: AuthUser;
  onDeleteAccount?: () => void;
}

export default function AuthAccount({ user, onDeleteAccount }: Props) {
  const [name, setName] = useState(user.name);
  const [nameEditing, setNameEditing] = useState(false);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [deleteMe] = useDeleteMeMutation();
  const dispatch = useAppDispatch();

  async function handlePickAvatar() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission required",
        "Allow photo library access to change your avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const form = new FormData();
    form.append("avatar", {
      uri: asset.uri,
      name: "avatar.jpg",
      type: asset.mimeType ?? "image/jpeg",
    } as any);
    try {
      await updateMe(form).unwrap();
    } catch {
      Alert.alert(
        "Upload failed",
        "Could not update avatar. Please try again.",
      );
    }
  }

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) {
      setNameEditing(false);
      return;
    }
    const form = new FormData();
    form.append("name", trimmed);
    try {
      await updateMe(form).unwrap();
    } catch {
      Alert.alert("Update failed", "Could not update name. Please try again.");
      setName(user.name);
    } finally {
      setNameEditing(false);
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all associated data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMe().unwrap();
              await SecureStore.deleteItemAsync("user_auth_token");
              dispatch(authActions.clearAuth());
            } catch {
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.wrap}>
      {/* Header row: avatar + name/email */}
      <View style={styles.headerRow}>
        <Pressable onPress={handlePickAvatar} style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {user.avatarUrl ? (
              <Image
                style={styles.avatarImage}
                source={{ uri: user.avatarUrl }}
                cachePolicy="memory-disk"
              />
            ) : (
              <Text style={styles.avatarLetter}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.avatarEditBadge}>
            <Icon source="camera" size={12} color="#fff" />
          </View>
        </Pressable>

        <View style={styles.headerInfo}>
          {/* Name */}
          {nameEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              mode="outlined"
              autoFocus
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
              style={styles.nameInput}
              outlineStyle={{ borderRadius: 10 }}
              right={
                isSaving ? (
                  <TextInput.Icon icon="loading" />
                ) : (
                  <TextInput.Icon icon="check" onPress={handleSaveName} />
                )
              }
            />
          ) : (
            <Pressable
              onPress={() => setNameEditing(true)}
              style={styles.nameRow}
            >
              <Text style={styles.profileName}>{user.name}</Text>
              <Icon
                source="pencil-outline"
                size={14}
                color="rgba(255,255,255,0.3)"
              />
            </Pressable>
          )}

          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>

        <Pressable
          onPress={handleDeleteAccount}
          style={styles.deleteBtn}
          hitSlop={10}
        >
          <Icon source="delete-forever" size={18} color="#ff3b30" />
        </Pressable>
      </View>

      {/* Recent Games */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon source="history" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.sectionTitle}>Recent Games</Text>
        </View>
        <RecentGames />
      </View>

      {/* Coming soon */}
      <View style={styles.featureRows}>
        <View style={styles.comingSoonRow}>
          <View style={styles.comingSoonLeft}>
            <Icon
              source="account-group"
              size={22}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.comingSoonLabel}>Friends</Text>
          </View>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>Soon</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  image: { width: CARD_WIDTH, height: CARD_HEIGHT },
  placeholder: { alignItems: "center", justifyContent: "center" },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  meta: {
    position: "absolute",
    bottom: 12,
    left: 14,
    right: 14,
    gap: 3,
  },
  sessionId: { fontSize: 13, fontWeight: "700", color: "#fff" },
  sub: { fontSize: 11, color: "rgba(255,255,255,0.55)" },
  stats: { flexDirection: "row", gap: 8, marginTop: 4 },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statText: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
});

const rg = StyleSheet.create({
  list: { gap: 12, paddingVertical: 2 },
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  placeholderText: { fontSize: 13, color: "rgba(255,255,255,0.3)" },
});

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 0 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
    marginBottom: 20,
  },
  headerInfo: { flex: 1, gap: 2 },

  avatarWrap: { position: "relative" },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MD2DarkTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(187,134,252,0.3)",
    overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80 },
  avatarLetter: { fontSize: 32, fontFamily: "Bebas", color: "#000" },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
  },

  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileName: { fontSize: 20, fontWeight: "700", color: "#fff" },
  nameInput: { backgroundColor: "transparent" },

  profileEmail: { fontSize: 13, color: "rgba(255,255,255,0.4)" },

  section: { width: "100%", gap: 10, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  featureRows: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  comingSoonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  comingSoonLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  comingSoonLabel: { fontSize: 15, color: "rgba(255,255,255,0.6)" },
  comingSoonBadge: {
    backgroundColor: "rgba(187,134,252,0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comingSoonBadgeText: { fontSize: 11, fontWeight: "600", color: "#BB86FC" },

  signOutBtn: {
    width: "100%",
    borderRadius: 25,
    borderColor: "rgba(207,102,121,0.4)",
    marginBottom: 12,
  },
  btnContent: { paddingVertical: 4 },

  deleteBtn: { alignSelf: "center", padding: 4 },
});
