import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Icon, Text, TextInput } from "react-native-paper";
import { Image } from "expo-image";
import { router } from "expo-router";
import type { AuthUser } from "../redux/auth/authSlice";
import {
  useRegenerateCodesMutation,
  useUpdateMeMutation,
} from "../redux/auth/authApi";
import { useGetGamesQuery } from "../redux/lists/listsApi";
import { getUserAvatarColor } from "../utils/avatar";
import { colors, fontSize, fontWeight, radius, spacing } from "../constants/design";

interface Props {
  user: AuthUser;
}

export default function AccountProfileHeader({ user }: Props) {
  const [name, setName] = useState(user.name);
  const [nameEditing, setNameEditing] = useState(false);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [regenerateCodes, { isLoading: isRegenerating }] =
    useRegenerateCodesMutation();
  const { data: gamesData } = useGetGamesQuery();
  const totalGames = gamesData?.games.length ?? 0;
  const totalMatches =
    gamesData?.games.reduce((sum, g) => sum + g.matchCount, 0) ?? 0;
  const totalSwipes =
    gamesData?.games.reduce(
      (sum, g) => sum + (g.session?.totalSwipes ?? 0),
      0,
    ) ?? 0;

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) {
      setNameEditing(false);
      return;
    }
    try {
      await updateMe({ name: trimmed }).unwrap();
    } catch {
      Alert.alert("Update failed", "Could not update name. Please try again.");
      setName(user.name);
    } finally {
      setNameEditing(false);
    }
  }

  function handleRegenerateCodes() {
    Alert.alert(
      "Regenerate recovery codes",
      "Your existing codes will be permanently invalidated and replaced with 8 new ones.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          onPress: async () => {
            try {
              const result = await regenerateCodes().unwrap();
              router.push({
                pathname: "/auth/recovery-codes",
                params: {
                  codes: JSON.stringify(result.recoveryCodes),
                  replacing: "true",
                },
              });
            } catch {
              Alert.alert(
                "Error",
                "Failed to regenerate codes. Please try again.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: getUserAvatarColor(user.name) }]}>
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

        <View style={styles.topInfo}>
          {nameEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              mode="outlined"
              autoFocus
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
              style={styles.nameInput}
              outlineStyle={{ borderRadius: radius.sm }}
              right={
                isSaving ? (
                  <TextInput.Icon icon="loading" />
                ) : (
                  <TextInput.Icon icon="check" onPress={handleSaveName} />
                )
              }
            />
          ) : (
            <Pressable onPress={() => setNameEditing(true)} style={styles.nameRow}>
              <Text style={styles.name}>{user.name}</Text>
              <Icon source="pencil-outline" size={13} color={colors.placeholder} />
            </Pressable>
          )}
          <Text style={styles.email}>{user.email}</Text>

          {user.provider === "email" && (
            <Pressable onPress={handleRegenerateCodes} disabled={isRegenerating}>
              <Text style={styles.linkText}>
                {isRegenerating ? "Regenerating…" : "Recovery codes"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalGames}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.statAccent]}>{totalMatches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalSwipes}</Text>
          <Text style={styles.statLabel}>Swipes</Text>
        </View>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 52;

const styles = StyleSheet.create({
  wrap: { width: "100%", gap: spacing.xl, marginBottom: spacing.sm },

  topRow: { flexDirection: "row", alignItems: "center", gap: spacing.md + 2 },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarLetter: { fontSize: fontSize.xxl + 2, fontFamily: "Bebas", color: colors.background },

  topInfo: { flex: 1, gap: 2 },

  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 1 },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  nameInput: { backgroundColor: "transparent" },
  email: { fontSize: fontSize.sm, color: colors.placeholder },
  linkText: {
    fontSize: fontSize.xs + 1,
    color: colors.primary,
    marginTop: 1,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md - 2,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  statAccent: { color: colors.primary },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: fontWeight.semibold,
  },
});
