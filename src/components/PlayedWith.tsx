import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { Image } from "expo-image";
import { useGetGameMembersQuery } from "../redux/lists/listsApi";

export default function PlayedWith() {
  const { data, isLoading } = useGetGameMembersQuery();
  const members = data?.members ?? [];

  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <Icon source="loading" size={16} color="rgba(255,255,255,0.3)" />
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.empty}>Play with someone to see them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {members.map((m) => (
        <View key={m.id} style={styles.chip}>
          <View style={styles.avatar}>
            {m.avatarUrl ? (
              <Image style={styles.avatarImg} source={{ uri: m.avatarUrl }} cachePolicy="memory-disk" />
            ) : (
              <Text style={styles.avatarLetter}>{m.name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.name} numberOfLines={1}>{m.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { paddingVertical: 12 },
  empty: { fontSize: 13, color: "rgba(255,255,255,0.3)" },
  list: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 24,
    paddingRight: 12,
    paddingLeft: 4,
    paddingVertical: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 28, height: 28 },
  avatarLetter: { fontSize: 12, fontWeight: "700", color: "#fff" },
  name: { fontSize: 13, color: "rgba(255,255,255,0.8)", maxWidth: 110 },
});
