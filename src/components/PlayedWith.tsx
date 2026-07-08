import { ScrollView, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { Image } from "expo-image";
import { useGetGameMembersQuery } from "../redux/lists/listsApi";

const AVATAR_SIZE = 52;

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
        <Icon source="account-group-outline" size={20} color="rgba(255,255,255,0.15)" />
        <Text style={styles.empty}>Play with someone to see them here</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {members.map((m) => (
        <View key={m.id} style={styles.card}>
          <View style={styles.avatar}>
            {m.avatarUrl ? (
              <Image
                style={styles.avatarImg}
                source={{ uri: m.avatarUrl }}
                cachePolicy="memory-disk"
              />
            ) : (
              <Text style={styles.avatarLetter}>
                {m.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {m.name.split(" ")[0]}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  empty: { fontSize: 13, color: "rgba(255,255,255,0.3)" },

  list: { gap: 16, paddingVertical: 4, paddingRight: 4 },

  card: { alignItems: "center", gap: 7, width: AVATAR_SIZE + 12 },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(187,134,252,0.3)",
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarLetter: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  name: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    fontWeight: "500",
  },
});
