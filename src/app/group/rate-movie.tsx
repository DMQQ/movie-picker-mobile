import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";
import PrimaryButton from "../../components/PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAppDispatch } from "../../redux/store";
import { usePatchItemMutation } from "../../redux/lists/listsApi";
import { rateInGroup } from "../../redux/favourites/favourites";
import { fontSize, radius, spacing } from "../../constants/design";

export default function RateMovieScreen() {
  const params = useLocalSearchParams<{
    movieId: string;
    groupId: string;
    remoteItemId?: string;
    listType?: string;
    rating?: string;
    note?: string;
  }>();

  const dispatch = useAppDispatch();
  const [patchItem] = usePatchItemMutation();

  const [rating, setRating] = useState<number | null>(
    params.rating ? Number(params.rating) : null
  );
  const [note, setNote] = useState(params.note ?? "");

  const handleSave = async () => {
    const payload = {
      rating: rating,
      note: note.trim() || null,
    };

    if (params.remoteItemId) {
      await patchItem({
        itemId: params.remoteItemId,
        listType: params.listType,
        ...payload,
      });
    } else {
      dispatch(rateInGroup({
        groupId: params.groupId,
        movieId: Number(params.movieId),
        ...payload,
      }));
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Rate this movie</Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <Pressable
            key={star}
            onPress={() => setRating(rating === star ? null : star)}
            hitSlop={6}
          >
            <MaterialCommunityIcons
              name={rating !== null && star <= rating ? "star" : "star-outline"}
              size={28}
              color={rating !== null && star <= rating ? "#FFD700" : "#555"}
            />
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.noteInput}
        placeholder="Add a note…"
        placeholderTextColor="#555"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={300}
      />

      <View style={styles.actions}>
        <Button mode="text" onPress={() => router.back()} textColor="#888">
          Cancel
        </Button>
        <PrimaryButton onPress={handleSave} disabled={rating === null}>
          Save
        </PrimaryButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: 22,
    fontFamily: "Bebas",
    marginBottom: spacing.xxl,
    letterSpacing: 0.5,
  },
  stars: {
    flexDirection: "row",
    gap: spacing.sm - 2,
    marginBottom: spacing.xxl,
  },
  noteInput: {
    backgroundColor: "#242424",
    borderRadius: radius.sm + 2,
    padding: spacing.md,
    color: "#fff",
    fontSize: fontSize.md,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: spacing.xxl,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});
