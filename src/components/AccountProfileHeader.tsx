import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Icon, Text, TextInput } from "react-native-paper";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { MD2DarkTheme } from "react-native-paper";
import type { AuthUser } from "../redux/auth/authSlice";
import { authActions } from "../redux/auth/authSlice";
import { useDeleteMeMutation, useRegenerateCodesMutation, useUpdateMeMutation } from "../redux/auth/authApi";
import { useAppDispatch } from "../redux/store";

interface Props {
  user: AuthUser;
}

export default function AccountProfileHeader({ user }: Props) {
  const [name, setName] = useState(user.name);
  const [nameEditing, setNameEditing] = useState(false);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [deleteMe] = useDeleteMeMutation();
  const [regenerateCodes, { isLoading: isRegenerating }] = useRegenerateCodesMutation();
  const dispatch = useAppDispatch();

  async function handlePickAvatar() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Allow photo library access to change your avatar.");
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
    form.append("avatar", { uri: asset.uri, name: "avatar.jpg", type: asset.mimeType ?? "image/jpeg" } as any);
    try {
      await updateMe(form).unwrap();
    } catch {
      Alert.alert("Upload failed", "Could not update avatar. Please try again.");
    }
  }

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) { setNameEditing(false); return; }
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
                params: { codes: JSON.stringify(result.recoveryCodes), replacing: "true" },
              });
            } catch {
              Alert.alert("Error", "Failed to regenerate codes. Please try again.");
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
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.row}>
      <Pressable onPress={handlePickAvatar} style={styles.avatarWrap}>
        <View style={styles.avatar}>
          {user.avatarUrl ? (
            <Image style={styles.avatarImage} source={{ uri: user.avatarUrl }} cachePolicy="memory-disk" />
          ) : (
            <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.avatarEditBadge}>
          <Icon source="camera" size={12} color="#fff" />
        </View>
      </Pressable>

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
              isSaving
                ? <TextInput.Icon icon="loading" />
                : <TextInput.Icon icon="check" onPress={handleSaveName} />
            }
          />
        ) : (
          <Pressable onPress={() => setNameEditing(true)} style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            <Icon source="pencil-outline" size={14} color="rgba(255,255,255,0.3)" />
          </Pressable>
        )}
        <Text style={styles.email}>{user.email}</Text>
        <Pressable onPress={handleRegenerateCodes} disabled={isRegenerating} style={styles.codesBtn}>
          <Icon source="shield-key-outline" size={12} color="rgba(187,134,252,0.7)" />
          <Text style={styles.codesBtnText}>{isRegenerating ? "Regenerating…" : "Recovery codes"}</Text>
        </Pressable>
      </View>

      <Pressable onPress={handleDeleteAccount} style={styles.deleteBtn} hitSlop={10}>
        <Icon source="delete-forever" size={18} color="#ff3b30" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
    marginBottom: 20,
  },
  info: { flex: 1, gap: 2 },

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
  name: { fontSize: 20, fontWeight: "700", color: "#fff" },
  nameInput: { backgroundColor: "transparent" },
  email: { fontSize: 13, color: "rgba(255,255,255,0.4)" },
  codesBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  codesBtnText: { fontSize: 11, color: "rgba(187,134,252,0.7)" },

  deleteBtn: { alignSelf: "center", padding: 4 },
});
