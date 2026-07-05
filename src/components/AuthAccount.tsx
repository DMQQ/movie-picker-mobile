import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Button, Icon, Text, TextInput } from "react-native-paper";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { MD2DarkTheme } from "react-native-paper";
import type { AuthUser } from "../redux/auth/authSlice";
import { useUpdateMeMutation } from "../redux/auth/authApi";

function ComingSoonRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.comingSoonRow}>
      <View style={styles.comingSoonLeft}>
        <Icon source={icon} size={22} color="rgba(255,255,255,0.5)" />
        <Text style={styles.comingSoonLabel}>{label}</Text>
      </View>
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonBadgeText}>Soon</Text>
      </View>
    </View>
  );
}

interface Props {
  user: AuthUser;
  onSignOut: () => void;
}

export default function AuthAccount({ user, onSignOut }: Props) {
  const [name, setName] = useState(user.name);
  const [nameEditing, setNameEditing] = useState(false);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();

  async function handlePickAvatar() {
    console.log("[Avatar] Requesting media library permission...");
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("[Avatar] Permission result:", perm);
    if (!perm.granted) {
      console.log("[Avatar] Permission denied");
      Alert.alert("Permission required", "Allow photo library access to change your avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    console.log("[Avatar] Picker result:", result);
    if (result.canceled) {
      console.log("[Avatar] User canceled picker");
      return;
    }

    const asset = result.assets[0];
    console.log("[Avatar] Selected asset:", { uri: asset.uri, mimeType: asset.mimeType, fileSize: asset.fileSize });

    const form = new FormData();
    form.append("avatar", {
      uri: asset.uri,
      name: "avatar.jpg",
      type: asset.mimeType ?? "image/jpeg",
    } as any);
    console.log("[Avatar] Uploading...");
    try {
      const res = await updateMe(form).unwrap();
      console.log("[Avatar] Upload success:", res);
    } catch (err) {
      console.log("[Avatar] Upload error:", err);
      Alert.alert("Upload failed", "Could not update avatar. Please try again.");
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
          onPress: () => {
            // TODO: call delete account API
          },
        },
      ]
    );
  }

  return (
    <View style={styles.wrap}>
      {/* Avatar */}
      <Pressable onPress={handlePickAvatar} style={styles.avatarWrap}>
        <View style={styles.avatar}>
          {user.avatarUrl ? (
            <Image
              style={styles.avatarImage}
              source={{ uri: user.avatarUrl }}
              cachePolicy="memory-disk"
            />
          ) : (
            <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.avatarEditBadge}>
          <Icon source="camera" size={12} color="#fff" />
        </View>
      </Pressable>

      {/* Name */}
      {nameEditing ? (
        <View style={styles.nameEditRow}>
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
        </View>
      ) : (
        <Pressable onPress={() => setNameEditing(true)} style={styles.nameRow}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Icon source="pencil-outline" size={14} color="rgba(255,255,255,0.3)" />
        </Pressable>
      )}

      <Text style={styles.profileEmail}>{user.email}</Text>

      {/* Coming soon rows */}
      <View style={styles.featureRows}>
        <ComingSoonRow icon="history" label="Recent Games" />
        <View style={styles.featureDivider} />
        <ComingSoonRow icon="account-group" label="Friends" />
      </View>

      {/* Actions */}
      <Button
        mode="outlined"
        onPress={onSignOut}
        icon="logout"
        style={styles.signOutBtn}
        contentStyle={styles.btnContent}
        textColor="#CF6679"
      >
        Sign out
      </Button>

      <Pressable onPress={handleDeleteAccount} style={styles.deleteRow}>
        <Icon source="delete-forever" size={16} color="rgba(207,102,121,0.6)" />
        <Text style={styles.deleteText}>Delete account & all data</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 0 },

  avatarWrap: { position: "relative", marginBottom: 12 },
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

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  profileName: { fontSize: 20, fontWeight: "700", color: "#fff" },
  nameEditRow: { width: "100%", marginBottom: 4 },
  nameInput: { backgroundColor: "transparent" },

  profileEmail: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 },

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
  featureDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginHorizontal: 16 },

  signOutBtn: { width: "100%", borderRadius: 25, borderColor: "rgba(207,102,121,0.4)", marginBottom: 12 },
  btnContent: { paddingVertical: 4 },

  deleteRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  deleteText: { fontSize: 13, color: "rgba(207,102,121,0.6)" },
});
