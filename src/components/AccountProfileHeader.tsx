import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Icon, Text, TextInput } from "react-native-paper";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { MD2DarkTheme } from "react-native-paper";
import type { AuthUser } from "../redux/auth/authSlice";
import { authActions } from "../redux/auth/authSlice";
import {
  useDeleteMeMutation,
  useRegenerateCodesMutation,
  useUpdateMeMutation,
} from "../redux/auth/authApi";
import { useGetGamesQuery } from "../redux/lists/listsApi";
import { useAppDispatch } from "../redux/store";

interface Props {
  user: AuthUser;
}

export default function AccountProfileHeader({ user }: Props) {
  const [name, setName] = useState(user.name);
  const [nameEditing, setNameEditing] = useState(false);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [deleteMe] = useDeleteMeMutation();
  const [regenerateCodes, { isLoading: isRegenerating }] =
    useRegenerateCodesMutation();
  const dispatch = useAppDispatch();
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
      <View style={styles.row}>
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

        <View style={styles.info}>
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
              <Text style={styles.name}>{user.name}</Text>
              <Icon
                source="pencil-outline"
                size={13}
                color="rgba(255,255,255,0.25)"
              />
            </Pressable>
          )}
          <Text style={styles.email}>{user.email}</Text>
          {user.provider === "email" && (
            <Pressable
              onPress={handleRegenerateCodes}
              disabled={isRegenerating}
              style={styles.codesBtn}
            >
              <Icon
                source="shield-key-outline"
                size={12}
                color="rgba(187,134,252,0.6)"
              />
              <Text style={styles.codesBtnText}>
                {isRegenerating ? "Regenerating…" : "Recovery codes"}
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={handleDeleteAccount}
          style={styles.deleteBtn}
          hitSlop={10}
        >
          <Icon source="delete-forever" size={18} color="rgba(255,59,48,0.6)" />
        </Pressable>
      </View>

      {totalGames > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon
              source="controller-classic"
              size={14}
              color="rgba(255,255,255,0.35)"
            />
            <Text style={styles.statValue}>{totalGames}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Icon source="heart" size={14} color="rgba(187,134,252,0.7)" />
            <Text style={[styles.statValue, styles.statValueAccent]}>
              {totalMatches}
            </Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Icon
              source="gesture-swipe"
              size={14}
              color="rgba(255,255,255,0.35)"
            />
            <Text style={styles.statValue}>{totalSwipes}</Text>
            <Text style={styles.statLabel}>Swipes</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const AVATAR_SIZE = 76;

const styles = StyleSheet.create({
  wrap: { width: "100%", gap: 16, marginBottom: 8 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  info: { flex: 1, gap: 3 },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: MD2DarkTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: "rgba(187,134,252,0.45)",
  },
  avatarImage: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarLetter: { fontSize: 30, fontFamily: "Bebas", color: "#000" },

  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 20, fontWeight: "700", color: "#fff" },
  nameInput: { backgroundColor: "transparent" },
  email: { fontSize: 12, color: "rgba(255,255,255,0.35)" },
  codesBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  codesBtnText: { fontSize: 11, color: "rgba(187,134,252,0.65)" },

  deleteBtn: { alignSelf: "flex-start", padding: 4 },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  statValueAccent: { color: "#BB86FC" },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
